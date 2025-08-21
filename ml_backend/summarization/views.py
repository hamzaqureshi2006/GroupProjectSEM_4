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

        full_text = (art.text or "").strip()
        if not full_text:
            return Response({"error": "No text found in the article"}, status=404)

        # --- Heuristic: adjust target summary length by article size (words) ---
        word_count = len(full_text.split())
        if word_count > 2500:
            target_max_len = 420
            target_min_len = 120
        elif word_count > 1600:
            target_max_len = 320
            target_min_len = 90
        elif word_count > 900:
            target_max_len = 240
            target_min_len = 70
        else:
            target_max_len = 180
            target_min_len = 50

        # --- Handle long inputs: chunk, summarize per chunk, then summarize the summaries ---
        def chunk_by_words(text, max_words=800):
            words = text.split()
            return [" ".join(words[i:i + max_words]) for i in range(0, len(words), max_words)]

        if word_count <= 900:
            result = summarizer(
                full_text,
                max_length=target_max_len,
                min_length=target_min_len,
                do_sample=False
            )
            final_summary = result[0]['summary_text']
        else:
            # Summarize chunks first to avoid input truncation in the model
            chunks = chunk_by_words(full_text, max_words=800)

            # Per-chunk target length (keep concise to help final pass)
            per_chunk_max = min(160, target_max_len)
            per_chunk_min = min(60, target_min_len)

            chunk_summaries = []
            for chunk in chunks:
                res = summarizer(
                    chunk,
                    max_length=per_chunk_max,
                    min_length=per_chunk_min,
                    do_sample=False
                )
                chunk_summaries.append(res[0]['summary_text'])

            combined = " ".join(chunk_summaries)

            # Final pass to produce a longer, cohesive summary
            final = summarizer(
                combined,
                max_length=target_max_len,
                min_length=target_min_len,
                do_sample=False
            )
            final_summary = final[0]['summary_text']

        return Response({"summary": final_summary})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
