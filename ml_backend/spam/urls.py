from django.urls import path
from . import views

urlpatterns = [
    path('api/comments/list/', views.comment_list, name='comment-list'),
    path('api/comments/create/', views.comment_create, name='comment-create'),  # <- trailing slash
]
