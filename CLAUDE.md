# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Memento is an assistive application for dementia patients that combines facial recognition, speech recognition, geolocation tracking, and reminder systems. The backend is built with FastAPI and MongoDB, providing REST APIs for the frontend mobile application.

## Core Technologies
- **FastAPI**: REST API framework
- **MongoDB**: Database for user data, relations, conversations, and reminders
- **OpenCV + DeepFace**: Facial recognition for identifying family members
- **Google Speech Recognition**: Conversation capture and transcription
- **Google Gemini AI**: Conversation analysis and relationship identification
- **Geopy**: Geolocation tracking for safety monitoring

## Running the Application

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Environment Setup
Create a `.env` file with:
```
MONGODB_URL=<your_mongodb_connection_string>
PY_ENV=development  # or 'production'
```

### Start the FastAPI Server
```bash
# Development (localhost)
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host localhost --port 8000
```

The server runs on:
- Development: `http://localhost:8000`
- Production: `http://0.0.0.0:8000`

### Run Face Recognition System
```bash
python FaceRecognition.py
```

### Run Speech Recognition Service
```bash
python speech_api.py
```

## Architecture

### Database Schema (MongoDB)
The main collection is `users` with the following structure:
```javascript
{
  "_id": ObjectId,
  "name": string,
  "email": string,
  "broadcastList": [emails],
  "relations": [
    {
      "id": UUID,  // Generated per person
      "name": string,
      "relationship": string,  // e.g., "mother", "son"
      "photo": string,  // Imgur URL
      "messages": [...],  // Conversation summaries
      "summary": string,  // Latest conversation summary
      "count": {
        "value": number,  // Number of interactions
        "first": datetime,
        "last": datetime
      }
    }
  ],
  "reminders": [
    {
      "id": number,  // Consecutive numerals
      "time": "HH:MM",
      "message": string
    }
  ]
}
```

### API Endpoints Structure
- `/` - Health check
- `/get-user` - Retrieve user profile
- `/create-user` - Create new user account
- `/add-relation` - Add/update recognized person
- `/count` - Track interaction counts
- `/message/add` - Store conversation summaries
- `/last-conv` - Get last conversation with a relation
- **Reminders:**
  - `/reminder/add` - Create reminder
  - `/reminder/get` - List all reminders
  - `/reminder/delete` - Delete by ID
  - `/check-reminder` - Check for due reminders

### Core Modules

**main.py**: FastAPI server with REST endpoints for user management, relations, and reminders

**mongo.py**: MongoDB connection and database schema definitions

**FaceRecognition.py**: Real-time facial recognition system that:
- Captures video from webcam
- Identifies known faces using DeepFace
- Creates UUIDs for new faces
- Triggers speech recording when face detected
- Uploads unknown faces to Imgur
- Integrates with backend APIs

**speech_api.py**: Speech recognition service that:
- Listens continuously for conversations
- Transcribes audio using Google Speech Recognition
- Analyzes conversations with Google Gemini AI
- Extracts name, relationship, and summary
- Posts results to backend

**reminder_geo.py**: Geolocation and reminder utilities (standalone functions, not directly used by main API)

### Key Integration Flow
1. **Face Detection** (FaceRecognition.py):
   - Detects face → generates UUID
   - Calls speech_api `/trigger-recording` with "start_recording"
   - Face leaves → calls with "stop_recording"

2. **Speech Processing** (speech_api.py):
   - Records conversation while face present
   - On stop, sends to Gemini for analysis
   - Returns name, relationship, summary
   - Posts to main backend `/message/add`

3. **Backend Storage** (main.py):
   - Receives relation data and stores in MongoDB
   - Updates interaction counts
   - Manages reminders

### External Service Dependencies
- **Imgur API**: For uploading face images (Client ID required)
- **Google Gemini AI**: For conversation analysis (API key required)
- **Google Speech Recognition**: For audio transcription

### CORS Configuration
Allowed origins:
- `http://localhost:3000`
- `http://localhost:8000`
- `https://memento-dashboard.vercel.app`

## Important Notes

### Hardcoded Values to Change
- `user_id` in main.py (line 28) is hardcoded to a specific ObjectId
- Imgur Client ID in FaceRecognition.py (line 199)
- Gemini API key in speech_api.py (line 23) is exposed in code
- ngrok URLs in FaceRecognition.py should be updated for deployment

### API Integration URLs
The codebase references these backend URLs:
- `https://memento-backend-5rw5.onrender.com` (production backend)
- `https://62e5-66-180-180-18.ngrok-free.app` (development speech API)

### Development Workflow
1. Start MongoDB instance
2. Run main FastAPI server (`python main.py`)
3. Run speech recognition service (`python speech_api.py`) on separate port
4. Run face recognition client (`python FaceRecognition.py`)
5. Frontend connects to FastAPI endpoints

### Security Considerations
- API keys and MongoDB URLs should be moved to environment variables
- The codebase currently has exposed credentials that need to be secured
- No authentication/authorization implemented on API endpoints
