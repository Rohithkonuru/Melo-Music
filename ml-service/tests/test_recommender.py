import pytest
from app.services.recommender import ContentBasedRecommender
from app.services.nlp_parser import NLPQueryParser

sample_songs = [
    {
        "id": "1",
        "title": "Cosmic Lullaby",
        "artistName": "Aether Echo",
        "genre": "Lo-Fi",
        "mood": "Chill",
        "language": "Instrumental",
        "playCount": 5000,
    },
    {
        "id": "2",
        "title": "Paper Cranes & Tea",
        "artistName": "Kyoto Rain",
        "genre": "Lo-Fi",
        "mood": "Chill",
        "language": "Instrumental",
        "playCount": 4000,
    },
    {
        "id": "3",
        "title": "Velocity Rush",
        "artistName": "Vortex Syndicate",
        "genre": "Electronic",
        "mood": "Workout",
        "language": "English",
        "playCount": 8000,
    },
    {
        "id": "4",
        "title": "Cyber Overdrive",
        "artistName": "Neon Velocity",
        "genre": "Electronic",
        "mood": "Workout",
        "language": "English",
        "playCount": 7000,
    },
    {
        "id": "5",
        "title": "Bourbon & Brass",
        "artistName": "Miles Sterling",
        "genre": "Jazz",
        "mood": "Chill",
        "language": "Instrumental",
        "playCount": 3000,
    },
]

def test_content_recommender():
    recommender = ContentBasedRecommender()
    # User likes Lo-Fi Chill song "1"
    recs = recommender.recommend(
        user_id="user-123",
        liked_song_ids=["1"],
        history_song_ids=[],
        candidate_songs=sample_songs,
        top_n=3,
    )

    assert len(recs) > 0
    # Song "2" is also Lo-Fi Chill, so it should receive highest similarity
    top_rec = recs[0]
    assert top_rec.songId == "2"
    assert top_rec.score > 0.5

def test_nlp_parser():
    parser = NLPQueryParser()

    # Query 1: relaxing study beats
    res1 = parser.parse("Give me relaxing lo-fi beats for studying")
    assert res1["mood"] in ["Chill", "Focus"]
    assert res1["genre"] == "Lo-Fi"
    assert res1["activity"] == "Study"

    # Query 2: energetic workout
    res2 = parser.parse("High energy workout music for the gym")
    assert res2["mood"] in ["Workout", "Energetic"]
    assert res2["activity"] == "Workout"
