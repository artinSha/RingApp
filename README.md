# Ring — AI English Conversation App

Ring is an interactive English-speaking practice platform for ESL learners.  
It simulates realistic phone conversations with an AI partner and provides instant grammar feedback at the end of each session.

---

## Overview

1. A user starts a simulated “call.”
2. The app selects a scenario (for example, airport check-in or food order).
3. The AI, powered by Google Gemini, begins the conversation.
4. The user replies using voice, which is transcribed using Google Speech-to-Text.
5. The AI continues naturally based on context.
6. When the call ends, the app analyzes the user’s speech and returns:
   - Grammar feedback
   - Suggested corrections
   - Success percentage
   - Number of turns and grammar issues

All conversations are stored in MongoDB. AI voice responses are generated using ElevenLabs Text-to-Speech.

---

## Tech Stack

| Component | Technology |
|------------|-------------|
| Backend | Flask (Python) |
| Database | MongoDB Atlas |
| AI Model | Google Gemini |
| Speech-to-Text | Google Cloud Speech-to-Text |
| Text-to-Speech | ElevenLabs API |
| Deployment | Railway |
| Audio Conversion | FFmpeg |
| Environment Config | Python dotenv |

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/ring-app.git
cd ring-app
```

### 2. Create and Activate a Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate    # For Mac/Linux
venv\Scripts\activate       # For Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Environment Variables
Create a .env file in your root and add:
```
MONGO_URI=<your MongoDB connection string>
GEMINI_API_KEY=<your Gemini API key>
GCP_KEY_JSON=<Google Cloud service account JSON string>
ELEVENLABS_API_KEY=<your ElevenLabs API key>
PORT=5000
```
