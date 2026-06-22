# app/ai/minilm.py
import re
from typing import List
from sentence_transformers import SentenceTransformer, util

_model = None

def get_model():
    global _model
    if _model is None:
        print("⏳ Loading AI Model (lazy)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("✅ AI Model Loaded")
    return _model


def clean_text(text: str) -> str:
    if not text:
        return ""
    # hyphens + numbers (important for models like A52, i-phone, etc.)
    text = re.sub(r"[^a-zA-Z0-9\s\-]", "", text)
    return text.lower().strip()


def find_best_matches(
    target_text: str,
    candidate_texts: List[str],
    threshold: float = 0.50
):
    """
    NLP-only function.
    No ORM. No DB. No assumptions.
    """

    if not target_text or not candidate_texts:
        return []

    model = get_model()

    clean_target = clean_text(target_text)
    clean_candidates = [clean_text(t) for t in candidate_texts]

    if not clean_target or not any(clean_candidates):
        return []

    target_embedding = model.encode(clean_target, convert_to_tensor=True)
    candidate_embeddings = model.encode(clean_candidates, convert_to_tensor=True)

    cosine_scores = util.cos_sim(target_embedding, candidate_embeddings)[0]

    results = []
    for idx, score in enumerate(cosine_scores):
        if score >= threshold:
            results.append({
                "index": idx,
                "score": float(score)
            })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results
