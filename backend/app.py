from flask import Flask, request, jsonify
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os
import openai

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Flask app
app = Flask(__name__)

# MongoDB connection
client = MongoClient(MONGO_URI)
db = client["ring_app"]
users_collection = db["users"]
conversations_collection = db["conversations"]

