import sys
import face_recognition
import cv2
import numpy as np
import requests
import threading
import time
from PyQt5.QtWidgets import QApplication, QWidget, QPushButton, QVBoxLayout, QLabel
from PyQt5.QtCore import QTimer
from PyQt5.QtGui import QPixmap
from uuid import uuid4
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get URLs from environment
SPEECH_API_URL = os.getenv("SPEECH_API_URL", "http://localhost:8001")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
IMGUR_CLIENT_ID = os.getenv("IMGUR_CLIENT_ID", "1846dba0b1de312")

# ============================================
# Face Recognition Configuration
# ============================================
# Number of frames to wait before checking for faces (higher = less CPU, lower = more responsive)
FACE_CHECK_INTERVAL = 50  # Check every 50 frames

# Number of checks without face detection before stopping recording
# At 30 FPS with FACE_CHECK_INTERVAL=50, this translates to:
#   2 checks = ~3.3 seconds wait
#   3 checks = ~5 seconds wait (RECOMMENDED)
#   4 checks = ~6.6 seconds wait
#   5 checks = ~8.3 seconds wait
STOP_RECORDING_AFTER_CHECKS = 3  # Wait ~5 seconds after face disappears

# Camera index (0 = built-in, 1 = external USB camera)
CAMERA_INDEX = 1


# Get a reference to the webcam
video_capture = cv2.VideoCapture(CAMERA_INDEX)

# Load known face
obama_image = face_recognition.load_image_file("chanakya.jpg")
obama_face_encoding = face_recognition.face_encodings(obama_image)[0]

# Initialize known faces
known_face_encodings = [obama_face_encoding]
known_face_uuid = [str(uuid4())]
uuid_to_name = {known_face_uuid[0]: "Chanakya", "no_face": "no_name"}

# Initialize variables
face_locations = []
face_encodings = []
face_names = []
face_uuids = []
process_this_frame = True
frame_c = 0
recordings = {}
display_names = True
display_remainder_modal = False
button_pressed_time = None
remainder_modal_start_time = None
relationship_info = {known_face_uuid[0]: "Friend", "no_face" : "no_relationship"}
latest_summary = {known_face_uuid[0]: "Sample chanakya summary", "no_face" : "no_summary"}
uuid_url = {known_face_uuid[0]: "Ignore this url", "no_face" : "no_url"}
once = 0
count = 0
current_uuid = None


# Video Processing
def process_video_frame():
    global face_locations, current_uuid, face_encodings, face_names, frame_c, process_this_frame, display_remainder_modal, count, face_uuids

    while True:
        ret, frame = video_capture.read()
        frame_c += 1

        if process_this_frame:
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_small_frame = np.ascontiguousarray(small_frame[:, :, ::-1], dtype=np.uint8)

            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
            face_uuids = []
            name = "no_face"
            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                uuid = None;
                face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                if len(face_distances):
                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index]:
                        uuid = known_face_uuid[best_match_index]

                if not uuid:
                    count += 1
                    new_uuid = str(uuid4())
                    name = f"New Person {count}"
                    known_face_encodings.append(face_encoding)
                    known_face_uuid.append(new_uuid)
                    uuid_to_name[new_uuid] = name
                    relationship_info[str(new_uuid)] = "Unknown"
                    latest_summary[str(new_uuid)] = "Unknown"
                    uuid = new_uuid
                    print(f"New person detected: {name} (UUID: {new_uuid[:8]}...)")
                    save_unknown_face(frame, uuid)

                current_uuid = uuid
                face_uuids.append(str(uuid))
                if str(uuid) not in recordings and len(recordings) < 8:
                    threading.Thread(target=trigger_recording_api, args=(uuid,)).start()
                    recordings[str(uuid)] = 1

            for rec in list(recordings.keys()):
                if rec not in face_uuids:
                    recordings[rec] += 1
                    print(f"{rec[:8]}... check {recordings[rec]}/{STOP_RECORDING_AFTER_CHECKS}")
                    if recordings[rec] == STOP_RECORDING_AFTER_CHECKS:
                        recordings.pop(rec)
                        threading.Thread(target=trigger_stop_recording_api, args=(rec,)).start()
                else:
                    recordings[rec] = 1

        process_this_frame = frame_c % FACE_CHECK_INTERVAL == 0

        if display_names:
            add_name_modal(frame, face_uuids)

        if display_remainder_modal:
            add_remainder_modal(frame)

        cv2.namedWindow('Video', cv2.WINDOW_NORMAL)
        cv2.resizeWindow('Video', 1280, 720)
        cv2.imshow('Video', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# Functions for face display, modal overlays, and API calls
def add_name_modal(frame, face_uuids):
    height, width, _ = frame.shape
    modal_width, modal_height = 300, 100
    x1, y1 = width - modal_width - 10, height - modal_height - 10
    x2, y2 = x1 + modal_width, y1 + modal_height

    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)
    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 255), 2)

    uuid = face_uuids[0] if face_uuids else "no_face"
    display_name = uuid_to_name.get(uuid, "Unknown")
    display_relationship = relationship_info.get(uuid, "Unknown")

    cv2.putText(frame, display_name, (x1 + 10, y1 + 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    cv2.putText(frame, f"{display_relationship}", (x1 + 10, y1 + 70),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 1)

def add_remainder_modal(frame):
    modal_width, modal_height = 500, 50
    x1, y1 = 10, 10
    x2, y2 = x1 + modal_width, y1 + modal_height
    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)
    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 255), 2)
    cv2.putText(frame, "Reminder: Take Medicines", (x1 + 10, y1 + 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

def save_unknown_face(frame, uuid):
    unknown_image_path = f"unknown_faces/face_{uuid}.jpg"
    cv2.imwrite(unknown_image_path, frame)
    uuid_url[uuid] = upload_to_imgur(unknown_image_path)
    print(f"Saved face image: {uuid_url[uuid]}")

def upload_to_imgur(img_path):
    import base64
    try:
        url = "https://api.imgur.com/3/image"
        headers = {"Authorization": f"Client-ID {IMGUR_CLIENT_ID}"}

        with open(img_path, "rb") as file:
            data = file.read()
            base64_data = base64.b64encode(data)

        response = requests.post(url, headers=headers, data={"image": base64_data})

        if response.status_code == 200:
            imgur_url = response.json()["data"]["link"]
            return imgur_url
        else:
            print(f"Imgur upload failed: {response.status_code}")
            return f"file://{os.path.abspath(img_path)}"
    except Exception as e:
        print(f"Error uploading to Imgur: {e}")
        return f"file://{os.path.abspath(img_path)}"

def trigger_recording_api(id):
    print(f"Starting recording for {id[:8]}...")
    payload = {"Task": "start_recording", "id": str(id)}
    response = requests.post(f"{SPEECH_API_URL}/trigger-recording", json=payload)
    print(f"  ✓ Recording started: {response.json()}")
    time.sleep(0.5)

def trigger_stop_recording_api(id):
    global name, relationship_info, latest_summary
    print(f"Stopping recording for {id[:8]}...")
    payload = {"Task": "stop_recording", "id": str(id)}
    response = requests.post(f"{SPEECH_API_URL}/trigger-recording", json=payload)
    json_response = response.json()
    print(f"Response: {json_response}")

    try:
        if 'ai_response' not in json_response:
            print(f"  ⚠️ No AI response for {id[:8]}...: {json_response.get('message', 'Unknown error')}")
            return

        ai_resp = json_response['ai_response']
        resp_relationship = ai_resp.get('Relationship') or ai_resp.get('relationship', 'acquaintances')
        resp_summary = ai_resp.get('convo_summary') or ai_resp.get('summary', 'No summary')
        resp_name = ai_resp.get('name', 'no_name')

        if resp_name != "no_name":
            uuid_to_name[id] = resp_name
            print(f"  ✓ UPDATED NAME: {id[:8]}... → {resp_name}")
        latest_summary[id] = resp_summary
        relationship_info[id] = resp_relationship
        print(f"  ✓ UPDATED RELATIONSHIP: {id[:8]}... → {resp_relationship}")

        data = {
            "relation" : {
                "id": id,
                "name": uuid_to_name[id],
                "relationship": relationship_info[id],
                "photo": uuid_url[id],
            }
        }
        response = requests.post(f"{BACKEND_URL}/add-relation", json=data)
        print(f"  ✓ Add Relation: {response.json()}")

        data = {
            "relation_id": id,
            "message": latest_summary[id],
        }
        response = requests.post(f"{BACKEND_URL}/message/add", json=data)
        print(f"  ✓ Message Add: {response.json()}")
    except Exception as e:
        print(f"  ✗ Error saving data: {str(e)}")

def toggle_modal_visibility():
    global display_names, button_pressed_time, remainder_modal_start_time, once, current_uuid
    threading.Thread(target=trigger_count_api, args=(current_uuid,)).start()
    display_names = not display_names
    button_pressed_time = time.time()
    remainder_modal_start_time = button_pressed_time + 3
    once += 1

def trigger_count_api(current):
    data = {"relation_id": current}
    requests.post(f"{BACKEND_URL}/count", json=data)


def check_modal_timers():
    global display_remainder_modal, remainder_modal_start_time, once
    if once == 1 and remainder_modal_start_time and time.time() >= remainder_modal_start_time:
        display_remainder_modal = True
        QTimer.singleShot(5000, hide_remainder_modal)

def hide_remainder_modal():
    global display_remainder_modal
    display_remainder_modal = False

# PyQt Setup
app = QApplication(sys.argv)
window = QWidget()
window.setWindowTitle("Video Feed")
layout = QVBoxLayout()

# Toggle button for visibility
toggle_button = QPushButton("Toggle Modal Visibility")
toggle_button.clicked.connect(toggle_modal_visibility)
layout.addWidget(toggle_button)

window.setLayout(layout)

timer = QTimer()
timer.timeout.connect(check_modal_timers)
timer.start(1000)

window.show()

process_video_frame()
sys.exit(app.exec_())

