from rest_framework.decorators import api_view
from rest_framework.response import Response
from newspaper import Article
from transformers import pipeline

# Load summarization model (download on first run)
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

@api_view(['POST'])
def extract_text(request):
    """
    Extracts the full text of a news article from a given URL.
    Expects: { "url": "<article_url>" }
    Returns: { "text": "<full_article_text>" }
    """
    url = request.data.get("url")
    if not url:
        return Response({"error": "URL is required"}, status=400)

    try:
        art = Article(url)
        art.download()
        art.parse()
        return Response({"text": art.text})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def summarize_article(request):
    """
    Summarizes the news article from a given URL.
    Expects: { "url": "<article_url>" }
    Returns: { "summary": "<summarized_text>" }
    """
    url = request.data.get("url")
    if not url:
        return Response({"error": "URL is required"}, status=400)

    try:
        # Extract the article text
        art = Article(url)
        art.download()
        art.parse()

        if not art.text.strip():
            return Response({"error": "No text found in the article"}, status=404)

        # Summarize the article
        summary = summarizer(
            art.text,
            max_length=200, 
            min_length=50,
            do_sample=False
        )

        return Response({"summary": summary[0]['summary_text']})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
