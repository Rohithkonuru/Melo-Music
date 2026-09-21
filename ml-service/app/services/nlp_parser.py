import re
from typing import Dict, Any

class NLPQueryParser:
    """
    Lightweight rule-based NLP intent extractor for natural language music queries.
    Maps free-form requests like 'Give me relaxing songs for studying' or
    'Play energetic Hindi songs for a workout' into structured parameters.
    """
    def __init__(self):
        self.mood_patterns = {
            "Chill": r"\b(chill|relax|calm|peaceful|soothing|laidback|unwind|ambient|mellow)\b",
            "Workout": r"\b(workout|gym|running|exercise|fitness|heavy|pumped|adrenaline)\b",
            "Energetic": r"\b(energetic|energy|hype|party|club|fast|dance|upbeat)\b",
            "Focus": r"\b(study|studying|focus|work|working|coding|read|reading|concentrate)\b",
            "Happy": r"\b(happy|joyful|cheerful|good vibes|uplifting|sunny|bright)\b",
            "Sad": r"\b(sad|crying|heartbreak|melancholy|gloomy|lonely|depressed)\b",
            "Romantic": r"\b(romantic|love|romance|date night|slow dance|candlelight|crush)\b",
            "Sleep": r"\b(sleep|sleeping|sleepy|nighttime|bedtime|insomnia|deep rest)\b",
        }

        self.genre_patterns = {
            "Lo-Fi": r"\b(lo-?fi|chillhop|vinyl beats)\b",
            "Pop": r"\b(pop|mainstream|radio|synthpop)\b",
            "Rock": r"\b(rock|indie rock|punk|metal|guitar)\b",
            "Electronic": r"\b(electronic|edm|techno|house|trance|synthwave|bass)\b",
            "Jazz": r"\b(jazz|blues|saxophone|trumpet|swing)\b",
            "Classical": r"\b(classical|piano|orchestra|violin|symphony|instrumental)\b",
            "Hip-Hop": r"\b(hip-?hop|rap|trap|urban)\b",
            "Indie": r"\b(indie|alternative|folk|acoustic)\b",
        }

        self.language_patterns = {
            "Hindi": r"\b(hindi|bollywood|desi|punjabi)\b",
            "Instrumental": r"\b(instrumental|no vocals|no words|beats only)\b",
            "English": r"\b(english|western)\b",
        }

    def parse(self, text: str) -> Dict[str, Any]:
        lower_text = text.lower()

        detected_mood = None
        for mood, pattern in self.mood_patterns.items():
            if re.search(pattern, lower_text):
                detected_mood = mood
                break

        detected_genre = None
        for genre, pattern in self.genre_patterns.items():
            if re.search(pattern, lower_text):
                detected_genre = genre
                break

        detected_lang = None
        for lang, pattern in self.language_patterns.items():
            if re.search(pattern, lower_text):
                detected_lang = lang
                break

        activity = None
        if re.search(r"\b(study|studying|coding|reading)\b", lower_text):
            activity = "Study"
        elif re.search(r"\b(workout|gym|running)\b", lower_text):
            activity = "Workout"
        elif re.search(r"\b(sleep|bed)\b", lower_text):
            activity = "Sleep"
        elif re.search(r"\b(party|dance)\b", lower_text):
            activity = "Party"

        return {
            "mood": detected_mood,
            "genre": detected_genre,
            "language": detected_lang,
            "activity": activity,
            "confidence": 0.9 if (detected_mood or detected_genre) else 0.5,
        }
