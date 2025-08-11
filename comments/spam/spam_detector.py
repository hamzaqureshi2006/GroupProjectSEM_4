import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

# Example dataset — you can replace with real spam/ham samples
TRAIN_TEXTS = [
    "win free lottery now",
    "claim your prize money",
    "urgent! click this link",
    "buy cheap products here",
    "earn money fast",
    "congratulations you won",
    "meet me at the park",
    "how are you doing today",
    "let's catch up tomorrow",
    "project meeting at 5pm",
    "free vacation offer",
    "limited time deal",
    "cheap loans available",
    "schedule for next week",
    "family dinner tonight",
    "your order has shipped",
    "urgent account verification",
    "please see attached report",
    "discount coupon inside",
    "love this video",
    "weekend hiking trip",
    "new movie release",
]
TRAIN_LABELS = [
    1, 1, 1, 1, 1, 1,   # spam
    0, 0, 0, 0,         # ham
    1, 1, 1,            # spam
    0, 0, 0, 0,         # ham
    1,                  # spam
    0, 0, 0, 0          # ham
]

class SpamDetector:
    def __init__(self, threshold=0.65, model_path="spam_model.pkl", vectorizer_path="vectorizer.pkl"):
        self.threshold = threshold
        self.model_path = model_path
        self.vectorizer_path = vectorizer_path
        self.vectorizer = CountVectorizer()

        if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
            self.classifier = joblib.load(self.model_path)
            self.vectorizer = joblib.load(self.vectorizer_path)
        else:
            self._train()

    def _train(self):
        X = self.vectorizer.fit_transform(TRAIN_TEXTS)
        self.classifier = MultinomialNB()
        self.classifier.fit(X, TRAIN_LABELS)

        joblib.dump(self.classifier, self.model_path)
        joblib.dump(self.vectorizer, self.vectorizer_path)

    def predict(self, text):
        X = self.vectorizer.transform([text])
        proba = self.classifier.predict_proba(X)[0][1] if hasattr(self.classifier, "predict_proba") else float(self.classifier.predict(X)[0])
        print(f"[spam-check] prob={proba:.3f} is_spam={proba >= self.threshold} text='{text}'")
        return float(proba)

spam_detector = SpamDetector(threshold=0.65)
