import os
import requests
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    RecommendRequest,
    RecommendResponse,
    MoodPlaylistRequest,
    MoodPlaylistResponse,
    NLPSearchRequest,
    NLPSearchResponse,
)
from app.services.recommender import ContentBasedRecommender
from app.services.nlp_parser import NLPQueryParser

router = APIRouter()
recommender = ContentBasedRecommender()
nlp_parser = NLPQueryParser()

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api")

def fetch_songs_from_backend() -> List[Dict[str, Any]]:
    try:
        res = requests.get(f"{BACKEND_API_URL}/songs?limit=100", timeout=3)
        if res.status_code == 200:
            data = res.json()
            return data.get("data", [])
    except Exception as e:
        print(f"[ML Service] Could not fetch songs from backend: {e}")
    return []

@router.post("/recommend", response_model=RecommendResponse)
def get_recommendations(req: RecommendRequest):
    candidate_songs = [s.model_dump() for s in req.songs] if req.songs else fetch_songs_from_backend()

    if not candidate_songs:
        return RecommendResponse(
            userId=req.userId,
            recommendations=[],
            model="TF-IDF Content Similarity (No candidate songs)",
        )

    recommendations = recommender.recommend(
        user_id=req.userId,
        liked_song_ids=req.userLikedSongIds,
        history_song_ids=req.userHistorySongIds,
        candidate_songs=candidate_songs,
        top_n=req.topN,
    )

    return RecommendResponse(
        userId=req.userId,
        recommendations=recommendations,
        model="TF-IDF Content Similarity",
    )

@router.post("/mood-playlist", response_model=MoodPlaylistResponse)
def generate_mood_playlist(req: MoodPlaylistRequest):
    candidate_songs = [s.model_dump() for s in req.songs] if req.songs else fetch_songs_from_backend()

    filtered = candidate_songs
    if req.mood and req.mood != "All":
        filtered = [s for s in filtered if s.get("mood", "").lower() == req.mood.lower()]

    if req.genre and req.genre != "All":
        genre_matches = [s for s in filtered if s.get("genre", "").lower() == req.genre.lower()]
        if len(genre_matches) >= 3:
            filtered = genre_matches

    if req.language and req.language != "All":
        lang_matches = [s for s in filtered if s.get("language", "").lower() == req.language.lower()]
        if lang_matches:
            filtered = lang_matches

    # If filtered is less than requested count, fill with remaining songs
    if len(filtered) < req.count:
        existing_ids = {str(s.get("id") or s.get("_id")) for s in filtered}
        more = [s for s in candidate_songs if str(s.get("id") or s.get("_id")) not in existing_ids]
        filtered.extend(more[: (req.count - len(filtered))])

    song_ids = [str(s.get("id") or s.get("_id")) for s in filtered[: req.count]]

    return MoodPlaylistResponse(
        mood=req.mood,
        genre=req.genre,
        count=len(song_ids),
        recommendedSongIds=song_ids,
    )

@router.post("/nlp-search", response_model=NLPSearchResponse)
def nlp_search(req: NLPSearchRequest):
    intent = nlp_parser.parse(req.query)
    return NLPSearchResponse(
        query=req.query,
        detectedIntent=intent,
    )
