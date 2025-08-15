from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from spam.spam_detector import spam_detector
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import numpy as np

# MongoDB connection
client = MongoClient(
    'mongodb+srv://truesphere:2006@socialmedia-cluster.radnq8s.mongodb.net/?retryWrites=true&w=majority&appName=socialmedia-cluster'
)
db = client['test']
comments_collection = db['comments']
users_collection = db['User']

# Helper to make MongoDB docs JSON-safe
def serialize_comment(comment):
    safe_comment = {}
    for key, value in comment.items():
        if isinstance(value, ObjectId):
            safe_comment[key] = str(value)
        elif isinstance(value, datetime):
            safe_comment[key] = value.isoformat()
        elif isinstance(value, np.bool_):
            safe_comment[key] = bool(value)
        elif isinstance(value, list):
            safe_comment[key] = [
                serialize_comment(v) if isinstance(v, dict) else v for v in value
            ]
        elif isinstance(value, dict):
            safe_comment[key] = serialize_comment(value)
        else:
            safe_comment[key] = value

    # Add UI-friendly badge color for spam
    safe_comment["badge_color"] = "red" if safe_comment.get("is_spam") else "transparent"
    return safe_comment

@api_view(['GET'])
def comment_list(request):
    video_id = request.query_params.get('video_id')
    if not video_id:
        return Response({"error": "video_id query param is required"}, status=status.HTTP_400_BAD_REQUEST)

    comments_cursor = comments_collection.find({"video_id": video_id})
    comments = []

    for c in comments_cursor:
        user = users_collection.find_one({"_id": c["user_id"]})
        c["user"] = user
        comments.append(serialize_comment(c))

    return Response(comments)

@api_view(['POST'])
def comment_create(request):
    data = request.data
    comment_text = data.get("commentText")
    user_id = data.get("user_id")
    video_id = data.get("video_id")

    if not all([comment_text, user_id, video_id]):
        return Response({"error": "commentText, user_id, and video_id are required"}, 
                        status=status.HTTP_400_BAD_REQUEST)

    # Spam check
    try:
        prob = spam_detector.predict(comment_text)
    except Exception as e:
        print("Spam detector error:", e)
        prob = 0.0
    is_spam = bool(prob >= spam_detector.threshold)

    # Create comment
    timestamp = datetime.utcnow()
    new_comment = {
        "user_id": user_id,
        "video_id": video_id,
        "commentText": comment_text,
        "is_spam": is_spam,
        "timestamp": timestamp,
        "likes": 0,
        "dislikes": 0,
        "replies": [],
        "isEdited": False,
    }

    inserted = comments_collection.insert_one(new_comment)
    new_comment["_id"] = inserted.inserted_id

    return Response(serialize_comment(new_comment), status=status.HTTP_201_CREATED)