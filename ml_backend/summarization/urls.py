from django.urls import path
from .views import extract_text,summarize_article
urlpatterns = [
    path('extract_text/', extract_text, name='extract_text'),
    path('summarize/', summarize_article, name='summarize_article'),
]