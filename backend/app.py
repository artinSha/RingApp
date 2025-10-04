from flask import Flask, request, jsonify
from pymongo import MongoClient
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
import openai
from bson.objectid import ObjectId
from flask_cors import CORS

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Flask app
app = Flask(__name__)
CORS(app)


# MongoDB connection
client = MongoClient(MONGO_URI)
db = client["ring_app"]
users_collection = db["users"]
conversations_collection = db["conversations"]


# Create a user
@app.route("/create_user", methods=["POST"])
def create_user():
    data = request.json or {}
    user = {
        "username": data.get("username"),
        "email": data.get("email"),
        "dnd_start": data.get("dnd_start", "09:00"),
        "dnd_end": data.get("dnd_end", "17:00"),
        "device_token": data.get("device_token", None),
        "created_at": datetime.now(timezone.utc)  # Changed here
    }
    res = users_collection.insert_one(user)
    return jsonify({"user_id": str(res.inserted_id)}), 201


"""
Call this endpoint from the frontend once the user accepts the call. First message from AI is sent.
"""
@app.route("/start_call", methods=["POST"])
def start_call():
    data = request.json or {}
    user_id = data.get("user_id")
    scenario = data.get("scenario", "General")

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    # Verify user exists
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "invalid user_id"}), 400

    # Create conversation document
    conv_doc = {
        "user_id": user_id,
        "scenario": scenario,
        "conversation": [],  # store AI+user turns
        "timestamp": datetime.now(timezone.utc),  # Changed here
        "grammar_feedback": None
    }
    conv_res = conversations_collection.insert_one(conv_doc)
    conv_id = str(conv_res.inserted_id)

    # -----------------------
    # Always generate first AI line
    # -----------------------
    ai_text = "Hello! This is a placeholder AI line for your scenario."
    # Save first AI turn
    conversations_collection.update_one(
        {"_id": ObjectId(conv_id)},
        {"$push": {"conversation": {
            "turn": 0,
            "user_text": None,
            "ai_text": ai_text,
            "created_at": datetime.now(timezone.utc)  # Changed here
        }}}
    )

    # Placeholder for TTS (ElevenLabs) - return None for now
    ai_audio_url = None

    payload = {
        "conversation_id": conv_id,
        "initial_ai_text": ai_text,
        "initial_ai_audio_url": ai_audio_url
    }

    return jsonify(payload), 201

# -------------------------------
# Helper: Transcription of user audio using Google Cloud STT
# -------------------------------
def transcribe_audio(audio_file):
    """
    Replace with Gemini/OpenAI transcription later.
    Currently just returns dummy text.
    """
    return "This is a placeholder transcription of user audio."

# -------------------------------
# Helper: placeholder AI response
# -------------------------------
def generate_ai_text(conversation_context):
    """
    Replace with Gemini API call later.
    Currently just returns dummy AI text.
    """
    return "Great! You should look for a safe spot immediately."

if __name__ == "__main__":
    app.run(debug=True)