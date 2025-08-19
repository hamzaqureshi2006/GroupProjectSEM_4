from django.urls import path
from . import views

urlpatterns = [
    path('recommend/', views.recommend_videos, name='recommend_videos'),
    path('recommend_posts/', views.recommend_posts, name='recommend_posts'),
]
