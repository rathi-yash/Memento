import speech_recognition as sr
from typing import Annotated
from groq import Groq
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
import time
import threading
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI()

url = os.getenv("BACKEND_URL", "http://localhost:8000") + "/message/add"
headers = {"Content-Type": "application/json"}
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

input_text = """Analyze the following conversation between two persons, 
Identify the relationship between them (e.g., friend, 
coworker, family member, client-professional) topics 
discussed, and interaction style. Provide a summary of 20 words.

example1: 

Hey! My weekend was fantastic I went to Paris with my family! My wife and kids were thrilled, 
though we explored so many iconic spots, from the Eiffel Tower to cozy 
little cafés along the Seine.

response:
{
    "name": "no_name",
    "relationship": "friend",
    "summary": "He had a fantastic weekend in Paris with his family. They explored iconic spots from the Eiffel Tower to cozy little cafés along the Seine."
}

example2:

Hey! My name is John. My day was amazing. I took the family out for a fun city adventure! My wife and kids were so excited as we hopped from one spot to another. How was yours dad?

response:
{
    "name": "John",
    "relationship": "Son",
    "summary": "John had an amazing day with his family. They went on a fun city adventure hopping from one spot to another."
}
If you can't identify the relationship, just say 'acquaintances' and use they/them pronouns. If you can't identify the name, just say 'no_name'.
CONVERSATION: 
"""


# Define models
Relation = Annotated[
    str,
    Field(min_length=1, max_length=1, description="A description of the relationship between two people having a conversation. For example, 'friends', 'colleagues', 'family', etc. Use third person and past tense.")
]

class Summary(BaseModel):
    name: str
    Relationship: str
    convo_summary: str

class RequestData(BaseModel):
    Task: str
    id: str

def get_llm_response(input_text):
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a conversation analyzer. You must respond with ONLY valid JSON in this exact format: {\"name\": \"...\", \"Relationship\": \"...\", \"convo_summary\": \"...\"}. Do not include any other text."
                },
                {
                    "role": "user",
                    "content": input_text
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=150,
            response_format={"type": "json_object"}
        )

        response_text = chat_completion.choices[0].message.content
        return response_text

    except Exception:
        return json.dumps({
            "name": "no_name",
            "Relationship": "acquaintances",
            "convo_summary": "Unable to analyze conversation due to API error."
        })

r = sr.Recognizer()
recordings = {}
recording_start_times = {}
is_recording = False
recording_event = threading.Event()
MIN_RECORDING_DURATION = 2.0

def listen_and_recognize():
    global is_recording
    while True:
        if is_recording:
            try:
                with sr.Microphone() as source:
                    r.energy_threshold = 300
                    r.dynamic_energy_threshold = True
                    audio = r.listen(source, timeout=5, phrase_time_limit=5)
                    text = r.recognize_google(audio)

                    if current_id in recordings:
                        recordings[current_id] += text.lower() + " "
            except sr.WaitTimeoutError:
                continue
            except sr.RequestError:
                continue
            except sr.UnknownValueError:
                continue
            except Exception:
                continue
        else:
            recording_event.wait()

recognition_thread = threading.Thread(target=listen_and_recognize, daemon=True)
recognition_thread.start()

@app.post("/trigger-recording")
async def trigger_recording(data: RequestData):
    global recordings, recording_start_times, is_recording, recording_event, current_id

    if data.Task.lower() == "start_recording":
        if data.id in recordings:
            return {"message": f"Recording already in progress for id: {data.id}"}

        recordings[data.id] = ""
        recording_start_times[data.id] = time.time()
        current_id = data.id
        is_recording = True
        recording_event.set()

        return {"message": f"Recording started for id: {data.id}"}

    elif data.Task.lower() == "stop_recording":
        if data.id not in recordings:
            return {"message": f"No recording in progress for id: {data.id}"}

        if data.id in recording_start_times:
            elapsed = time.time() - recording_start_times[data.id]
            if elapsed < MIN_RECORDING_DURATION:
                return {"message": f"Recording too short ({elapsed:.1f}s), minimum {MIN_RECORDING_DURATION}s required"}

        if not recordings[data.id] or not recordings[data.id].strip():
            return {"message": f"No speech captured for id: {data.id}"}

        is_recording = False
        recording_event.clear()

        final_input = input_text + recordings[data.id]
        ai_response = get_llm_response(final_input)
        ai_response = json.loads(ai_response)

        relationship_key = 'Relationship' if 'Relationship' in ai_response else 'relationship'

        payload = {
            "id": data.id,
            "name": ai_response.get('name', 'no_name'),
            "relationship": ai_response.get(relationship_key, 'acquaintances'),
            "summary": ai_response.get('convo_summary', ai_response.get('summary', 'No summary available'))
        }
        message = {"relation_id": data.id, "message": payload}
        requests.post(url, json=message, headers=headers)

        del recordings[data.id]
        if data.id in recording_start_times:
            del recording_start_times[data.id]

        return JSONResponse(content={"id": data.id, "ai_response": ai_response})

    else:
        raise HTTPException(status_code=400, detail="Invalid task")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)