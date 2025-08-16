from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

@csrf_exempt
@require_http_methods(["POST"])
def recommend_videos(request):
    """
    Video recommendation endpoint using TF-IDF and cosine similarity
    """
    try:
        # Parse the request body
        data = json.loads(request.body)
        video = data.get('video', {})
        all_videos = data.get('allVideos', [])
        
        if not video or not all_videos:
            return JsonResponse({
                'error': 'Missing video or allVideos data'
            }, status=400)
        
        # Prepare text data for each video
        video_texts = []
        video_ids = []
        
        for v in all_videos:
            # Combine title, description, and tags into a single text
            title = v.get('title', '')
            description = v.get('description', '')
            tags = ' '.join(v.get('tags', []))
            
            # Clean and combine text
            combined_text = f"{title} {description} {tags}".lower()
            # Remove special characters and extra spaces
            combined_text = re.sub(r'[^a-zA-Z0-9\s]', ' ', combined_text)
            combined_text = re.sub(r'\s+', ' ', combined_text).strip()
            
            video_texts.append(combined_text)
            video_ids.append(v.get('_id'))
        
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        tfidf_matrix = vectorizer.fit_transform(video_texts)
        
        # Find the index of the current video
        current_video_index = None
        for i, vid_id in enumerate(video_ids):
            if str(vid_id) == str(video.get('_id')):
                current_video_index = i
                break
        
        if current_video_index is None:
            return JsonResponse({
                'error': 'Current video not found in allVideos list'
            }, status=400)
        
        # Calculate cosine similarity
        current_video_vector = tfidf_matrix[current_video_index:current_video_index+1]
        similarities = cosine_similarity(current_video_vector, tfidf_matrix).flatten()
        
        # Get indices of top 5 similar videos (excluding the current video)
        similar_indices = np.argsort(similarities)[::-1]
        recommended_indices = []
        
        for idx in similar_indices:
            if idx != current_video_index and len(recommended_indices) < 5:
                recommended_indices.append(idx)
        
        # Get recommended video IDs
        recommended_video_ids = [video_ids[idx] for idx in recommended_indices]
        
        return JsonResponse({
            'recommended_video_ids': recommended_video_ids,
            'similarities': [float(similarities[idx]) for idx in recommended_indices]
        })
        
    except Exception as e:
        return JsonResponse({
            'error': f'An error occurred: {str(e)}'
        }, status=500)
