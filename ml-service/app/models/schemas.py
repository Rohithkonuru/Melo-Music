from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SongMetadata(BaseModel):
    id: str
    title: str
    artistName: str
    genre: str
    mood: str
    language: str = "English"
    albumTitle: Optional[str] = None
    playCount: int = 0

class RecommendRequest(BaseModel):
    userId: str
    userLikedSongIds: List[str] = []
    userHistorySongIds: List[str] = []
    topN: int = 10
    songs: Optional[List[SongMetadata]] = None

class RecommendationItem(BaseModel):
    songId: str
    score: float

class RecommendResponse(BaseModel):
    userId: str
    recommendations: List[RecommendationItem]
    model: str = "TF-IDF Content Similarity"

class MoodPlaylistRequest(BaseModel):
    mood: Optional[str] = None
    genre: Optional[str] = None
    language: Optional[str] = None
    count: int = 12
    songs: Optional[List[SongMetadata]] = None

class MoodPlaylistResponse(BaseModel):
    mood: Optional[str]
    genre: Optional[str]
    count: int
    recommendedSongIds: List[str]

class NLPSearchRequest(BaseModel):
    query: str

class NLPSearchResponse(BaseModel):
    query: str
    detectedIntent: Dict[str, Any]
