from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.schemas import SongMetadata, RecommendationItem

class BaseRecommender(ABC):
    """
    Abstract base class for all Melomix recommendation engines.
    Allows easy addition of Collaborative Filtering, Matrix Factorization,
    or Hybrid engines without modifying the API contract.
    """
    @abstractmethod
    def recommend(
        self,
        user_id: str,
        liked_song_ids: List[str],
        history_song_ids: List[str],
        candidate_songs: List[Dict[str, Any]],
        top_n: int = 10,
    ) -> List[RecommendationItem]:
        pass

class ContentBasedRecommender(BaseRecommender):
    """
    Content-Based Filtering using TF-IDF across song metadata:
    genre, mood, artistName, language, albumTitle.
    Computes cosine similarity between user profile vector and candidate tracks.
    """
    def __init__(self):
        self.vectorizer = TfidfVectorizer(token_pattern=r"(?u)\b[\w-]+\b", lowercase=True)

    def _build_feature_string(self, song: Dict[str, Any]) -> str:
        # Boost genre and mood by repeating terms for higher TF-IDF weight
        genre = (song.get("genre") or "").strip()
        mood = (song.get("mood") or "").strip()
        artist = (song.get("artistName") or "").strip().replace(" ", "_")
        language = (song.get("language") or "").strip()
        album = (song.get("albumTitle") or "").strip()

        # Weighted metadata bag of words
        features = [
            f"genre_{genre} " * 3,
            f"mood_{mood} " * 3,
            f"artist_{artist} " * 2,
            f"lang_{language} ",
            f"album_{album} " if album else ""
        ]
        return " ".join(features)

    def recommend(
        self,
        user_id: str,
        liked_song_ids: List[str],
        history_song_ids: List[str],
        candidate_songs: List[Dict[str, Any]],
        top_n: int = 10,
    ) -> List[RecommendationItem]:
        if not candidate_songs:
            return []

        df = pd.DataFrame(candidate_songs)
        if "id" not in df.columns and "_id" in df.columns:
            df["id"] = df["_id"].astype(str)
        else:
            df["id"] = df["id"].astype(str)

        # Build feature text for every candidate song
        df["features"] = [self._build_feature_string(song) for song in candidate_songs]

        # Fit TF-IDF matrix
        tfidf_matrix = self.vectorizer.fit_transform(df["features"])

        # Determine user seed songs (liked songs get weight 1.0, history gets weight 0.6)
        seed_indices = []
        seed_weights = []

        song_id_to_index = {row["id"]: idx for idx, row in df.iterrows()}

        for song_id in liked_song_ids:
            if song_id in song_id_to_index:
                seed_indices.append(song_id_to_index[song_id])
                seed_weights.append(1.0)

        for song_id in history_song_ids:
            if song_id in song_id_to_index and song_id_to_index[song_id] not in seed_indices:
                seed_indices.append(song_id_to_index[song_id])
                seed_weights.append(0.6)

        # If user has no history or likes, use popularity/diversity fallback
        if not seed_indices:
            # Fallback: rank by playCount with slight randomization
            ranked = df.sort_values(by="playCount", ascending=False).head(top_n)
            return [
                RecommendationItem(songId=str(row["id"]), score=round(float(0.5 + (0.4 * (1.0 / (idx + 1)))), 3))
                for idx, (_, row) in enumerate(ranked.iterrows())
            ]

        # Calculate weighted average user profile vector
        user_vector = np.zeros((1, tfidf_matrix.shape[1]))
        total_weight = sum(seed_weights)

        for idx, weight in zip(seed_indices, seed_weights):
            user_vector += weight * tfidf_matrix[idx].toarray()

        user_vector = user_vector / total_weight

        # Compute cosine similarity between user profile and all songs
        sim_scores = cosine_similarity(user_vector, tfidf_matrix).flatten()

        # Exclude songs user already explicitly liked
        liked_set = set(liked_song_ids)
        scored_items: List[Tuple[str, float]] = []

        for idx, score in enumerate(sim_scores):
            song_id = df.iloc[idx]["id"]
            if song_id not in liked_set or len(df) <= top_n:
                # Add tiny playCount boost for tie-breaking
                play_count = df.iloc[idx].get("playCount", 0)
                boosted_score = float(score) + min(0.05, (play_count / 200000.0))
                scored_items.append((song_id, round(float(boosted_score), 4)))

        # Sort descending by similarity score
        scored_items.sort(key=lambda x: x[1], reverse=True)

        return [
            RecommendationItem(songId=item[0], score=item[1])
            for item in scored_items[:top_n]
        ]
