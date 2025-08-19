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
    Video recommendation endpoint using TF-IDF and cosine similarity, with fallback to recent/random videos.
    """
    try:
        data = json.loads(request.body)
        video = data.get('video', {})
        all_videos = data.get('allVideos', [])
        if not all_videos:
            # Fallback: return up to 5 most recent/random videos
            return JsonResponse({
                'recommended_video_ids': [],
                'similarities': []
            })
        if not video:
            # Fallback: just return first 5 videos
            recommended_video_ids = [v.get('_id') for v in all_videos[:5]]
            return JsonResponse({
                'recommended_video_ids': recommended_video_ids,
                'similarities': [1.0]*len(recommended_video_ids)
            })
        # Prepare text data for each video
        video_texts = []
        video_ids = []
        for v in all_videos:
            title = v.get('title', '')
            description = v.get('description', '')
            tags = ' '.join(v.get('tags', []))
            combined_text = f"{title} {description} {tags}".lower()
            combined_text = re.sub(r'[^a-zA-Z0-9\s]', ' ', combined_text)
            combined_text = re.sub(r'\s+', ' ', combined_text).strip()
            video_texts.append(combined_text)
            video_ids.append(v.get('_id'))
        vectorizer = TfidfVectorizer(max_features=1000, stop_words='english', ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform(video_texts)
        current_video_index = None
        for i, vid_id in enumerate(video_ids):
            if str(vid_id) == str(video.get('_id')):
                current_video_index = i
                break
        if current_video_index is None:
            # Fallback: just return first 5 videos
            recommended_video_ids = [v.get('_id') for v in all_videos[:5]]
            return JsonResponse({
                'recommended_video_ids': recommended_video_ids,
                'similarities': [1.0]*len(recommended_video_ids)
            })
        current_video_vector = tfidf_matrix[current_video_index:current_video_index+1]
        similarities = cosine_similarity(current_video_vector, tfidf_matrix).flatten()
        similar_indices = np.argsort(similarities)[::-1]
        recommended_indices = []
        for idx in similar_indices:
            if idx != current_video_index and len(recommended_indices) < 5:
                recommended_indices.append(idx)
        recommended_video_ids = [video_ids[idx] for idx in recommended_indices]
        return JsonResponse({
            'recommended_video_ids': recommended_video_ids,
            'similarities': [float(similarities[idx]) for idx in recommended_indices]
        })
    except Exception as e:
        # Fallback: just return empty
        return JsonResponse({
            'recommended_video_ids': [],
            'similarities': []
        }, status=200)

# --- POST RECOMMENDATION ENDPOINT ---
@csrf_exempt
@require_http_methods(["POST"])
def recommend_posts(request):
    """
    Post recommendation endpoint using TF-IDF and cosine similarity, with fallback to recent/random posts.
    """
    try:
        data = json.loads(request.body)
        post = data.get('post', {})
        all_posts = data.get('allPosts', [])
        if not all_posts:
            return JsonResponse({
                'recommended_post_ids': [],
                'similarities': []
            })
        if not post:
            recommended_post_ids = [p.get('_id') for p in all_posts[:5]]
            return JsonResponse({
                'recommended_post_ids': recommended_post_ids,
                'similarities': [1.0]*len(recommended_post_ids)
            })
        post_texts = []
        post_ids = []
        for p in all_posts:
            title = p.get('title', '')
            content = p.get('content', '')
            tags = ' '.join(p.get('tags', []))
            combined_text = f"{title} {content} {tags}".lower()
            combined_text = re.sub(r'[^a-zA-Z0-9\s]', ' ', combined_text)
            combined_text = re.sub(r'\s+', ' ', combined_text).strip()
            post_texts.append(combined_text)
            post_ids.append(p.get('_id'))
        vectorizer = TfidfVectorizer(max_features=1000, stop_words='english', ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform(post_texts)
        current_post_index = None
        for i, pid in enumerate(post_ids):
            if str(pid) == str(post.get('_id')):
                current_post_index = i
                break
        if current_post_index is None:
            recommended_post_ids = [p.get('_id') for p in all_posts[:5]]
            return JsonResponse({
                'recommended_post_ids': recommended_post_ids,
                'similarities': [1.0]*len(recommended_post_ids)
            })
        current_post_vector = tfidf_matrix[current_post_index:current_post_index+1]
        similarities = cosine_similarity(current_post_vector, tfidf_matrix).flatten()
        similar_indices = np.argsort(similarities)[::-1]
        recommended_indices = []
        for idx in similar_indices:
            if idx != current_post_index and len(recommended_indices) < 5:
                recommended_indices.append(idx)
        recommended_post_ids = [post_ids[idx] for idx in recommended_indices]
        return JsonResponse({
            'recommended_post_ids': recommended_post_ids,
            'similarities': [float(similarities[idx]) for idx in recommended_indices]
        })
    except Exception as e:
        return JsonResponse({
            'recommended_post_ids': [],
            'similarities': []
        }, status=200)
