from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from spam.spam_detector import spam_detector
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import numpy as np

# MongoDB connection - using the same connection as the API
client = MongoClient(
    'mongodb+srv://truesphere:2006@socialmedia-cluster.radnq8s.mongodb.net/?retryWrites=true&w=majority&appName=socialmedia-cluster'
)
# Try different database names to find the correct one
db = client['truesphere']  # Try this database name first
comments_collection = db['comments']
users_collection = db['users']

# Debug: Print available collections
print(f"Database name: {db.name}")
print(f"Available collections: {db.list_collection_names()}")
print(f"Users collection count: {users_collection.count_documents({})}")

# If no users found, try other database names
if users_collection.count_documents({}) == 0:
    print("No users found in 'truesphere' database, trying 'test'...")
    db = client['test']
    users_collection = db['users']
    comments_collection = db['comments']
    print(f"Database name: {db.name}")
    print(f"Available collections: {db.list_collection_names()}")
    print(f"Users collection count: {users_collection.count_documents({})}")

# Helper to make MongoDB docs JSON-safe
def serialize_user(user):
    if not user:
        return None
    safe_user = {}
    for key, value in user.items():
        if isinstance(value, ObjectId):
            safe_user[key] = str(value)
        elif isinstance(value, datetime):
            safe_user[key] = value.isoformat()
        elif isinstance(value, np.bool_):
            safe_user[key] = bool(value)
        elif isinstance(value, list):
            # Handle arrays that might contain ObjectIds
            safe_user[key] = [str(v) if isinstance(v, ObjectId) else v for v in value]
        else:
            safe_user[key] = value
    return safe_user

def serialize_comment(comment):
    safe_comment = {}
    for key, value in comment.items():
        if key == "user" and value:
            safe_comment[key] = serialize_user(value)
        elif isinstance(value, ObjectId):
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
    print(f"Requested video_id: {video_id}")
    
    if not video_id:
        return Response({"error": "video_id query param is required"}, status=status.HTTP_400_BAD_REQUEST)

    comments_cursor = comments_collection.find({"video_id": video_id})
    comments = []
    
    # Count total comments for this video
    total_comments = comments_collection.count_documents({"video_id": video_id})
    print(f"Total comments found for video {video_id}: {total_comments}")
    
    # Debug: Show all unique video_ids in comments collection
    if total_comments == 0:
        all_video_ids = comments_collection.distinct("video_id")
        print(f"Available video_ids in comments collection: {all_video_ids}")

    for c in comments_cursor:
        try:
            user = users_collection.find_one({"_id": ObjectId(c["user_id"])})
            c["user"] = user
        except Exception as e:
            print(f"Error fetching user data for comment {c.get('_id')}: {e}")
            c["user"] = None
        serialized_comment = serialize_comment(c)
        comments.append(serialized_comment)

    print(f"Returning {len(comments)} comments")
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

    # Populate user data for the response
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        new_comment["user"] = user
    except Exception as e:
        print(f"Error fetching user data: {e}")
        new_comment["user"] = None

    serialized_comment = serialize_comment(new_comment)
    return Response(serialized_comment, status=status.HTTP_201_CREATED)