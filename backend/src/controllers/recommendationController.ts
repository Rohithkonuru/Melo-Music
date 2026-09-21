import { Response, NextFunction } from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import { Song, User, ListeningHistory, Recommendation } from '../models';
import { env } from '../config/env';
import { sendResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get personalized recommendations for user
// @route   GET /api/recommendations
export const getRecommendations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const limit = parseInt(req.query.limit as string) || 12;

    let userHistorySongIds: string[] = [];
    let userLikedSongIds: string[] = [];

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userLikedSongIds = user.likedSongs.map((id) => id.toString());
        const recentHistory = await ListeningHistory.find({ user: userId })
          .sort({ playedAt: -1 })
          .limit(10);
        userHistorySongIds = recentHistory.map((h) => h.song.toString());
      }
    }

    const allSongs = await Song.find().populate('artist', 'name image');

    // Attempt to call Python FastAPI ML Service
    try {
      const mlResponse = await axios.post(
        `${env.ML_SERVICE_URL}/recommend`,
        {
          userId: userId?.toString() || 'guest',
          userLikedSongIds,
          userHistorySongIds,
          topN: limit,
        },
        { timeout: 3500 }
      );

      if (mlResponse.data && Array.isArray(mlResponse.data.recommendations)) {
        const recommendedIds = mlResponse.data.recommendations.map((r: any) => r.songId);
        const scoreMap = new Map<string, number>();
        mlResponse.data.recommendations.forEach((r: any) => {
          scoreMap.set(r.songId, r.score);
        });

        const recSongs = allSongs.filter((s) => recommendedIds.includes(s._id.toString()));
        recSongs.sort((a, b) => (scoreMap.get(b._id.toString()) || 0) - (scoreMap.get(a._id.toString()) || 0));

        return sendResponse({
          res,
          data: {
            source: 'ml-service',
            recommendations: recSongs,
            algorithm: 'TF-IDF Content Similarity',
          },
        });
      }
    } catch {
      // Fallback: Smart content-based recommendation logic in Node.js
    }

    // Node.js Content-Based Fallback
    // Identify user's favorite genres/moods from liked songs or recently played
    const seedSongs = allSongs.filter((s) =>
      userLikedSongIds.includes(s._id.toString()) || userHistorySongIds.includes(s._id.toString())
    );

    const preferredGenres = new Set(seedSongs.map((s) => s.genre));
    const preferredMoods = new Set(seedSongs.map((s) => s.mood));

    let scoredSongs = allSongs.map((song) => {
      let score = 0.3; // base score
      if (preferredGenres.has(song.genre)) score += 0.4;
      if (preferredMoods.has(song.mood)) score += 0.3;
      // popularity weighting
      score += Math.min(0.2, (song.playCount / 100000));
      return { song, score };
    });

    // Exclude songs already liked if we have enough
    const filtered = scoredSongs.filter((item) => !userLikedSongIds.includes(item.song._id.toString()));
    const finalSelection = filtered.length >= limit ? filtered : scoredSongs;

    finalSelection.sort((a, b) => b.score - a.score);
    const resultSongs = finalSelection.slice(0, limit).map((item) => item.song);

    return sendResponse({
      res,
      data: {
        source: 'content-engine',
        recommendations: resultSongs,
        algorithm: 'Genre & Mood Matcher',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate a playlist for my mood
// @route   POST /api/recommendations/mood-playlist
export const generateMoodPlaylist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { mood, genre, language, count = 12 } = req.body;

    const query: Record<string, any> = {};
    if (mood && mood !== 'All') {
      query.mood = { $regex: new RegExp(`^${mood}$`, 'i') };
    }
    if (genre && genre !== 'All') {
      query.genre = { $regex: new RegExp(`^${genre}$`, 'i') };
    }
    if (language && language !== 'All') {
      query.language = { $regex: new RegExp(`^${language}$`, 'i') };
    }

    let matchingSongs = await Song.find(query)
      .populate('artist', 'name image')
      .populate('album', 'title coverUrl')
      .sort({ playCount: -1 })
      .limit(Number(count));

    // If not enough songs with strict filter, loosen genre/language
    if (matchingSongs.length < Number(count) && mood && mood !== 'All') {
      const moreSongs = await Song.find({
        mood: { $regex: new RegExp(`^${mood}$`, 'i') },
        _id: { $nin: matchingSongs.map((s) => s._id) },
      })
        .populate('artist', 'name image')
        .limit(Number(count) - matchingSongs.length);
      matchingSongs = [...matchingSongs, ...moreSongs];
    }

    return sendResponse({
      res,
      data: {
        mood,
        genre: genre || 'All',
        language: language || 'All',
        total: matchingSongs.length,
        songs: matchingSongs,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Natural Language Search Parser
// @route   POST /api/recommendations/natural-search
export const naturalLanguageSearch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;
    if (!query) {
      return sendResponse({ res, data: { songs: [], intent: {} } });
    }

    const text = (query as string).toLowerCase();

    // Lightweight NLP rule-based intent extractor
    const intent: Record<string, string> = {};

    // Detect Mood
    if (/chill|relax|calm|peace|sooth|quiet|lo-fi|lofi/i.test(text)) intent.mood = 'Chill';
    else if (/workout|gym|run|energy|adrenaline|hype/i.test(text)) intent.mood = 'Workout';
    else if (/energetic|pump|party|club|fast/i.test(text)) intent.mood = 'Energetic';
    else if (/study|focus|read|work|code|concentrate/i.test(text)) intent.mood = 'Focus';
    else if (/happy|joy|upbeat|smile|feel good|sun/i.test(text)) intent.mood = 'Happy';
    else if (/sad|cry|heartbreak|melanchol|lonely/i.test(text)) intent.mood = 'Sad';
    else if (/romantic|love|date|night|candle/i.test(text)) intent.mood = 'Romantic';
    else if (/sleep|bed|dream|night/i.test(text)) intent.mood = 'Sleep';

    // Detect Genre
    if (/lo-?fi/i.test(text)) intent.genre = 'Lo-Fi';
    else if (/pop/i.test(text)) intent.genre = 'Pop';
    else if (/rock|guitar/i.test(text)) intent.genre = 'Rock';
    else if (/electronic|edm|techno|synth/i.test(text)) intent.genre = 'Electronic';
    else if (/jazz|brass|trumpet/i.test(text)) intent.genre = 'Jazz';
    else if (/classical|piano|orchestra/i.test(text)) intent.genre = 'Classical';
    else if (/hip-?hop|rap/i.test(text)) intent.genre = 'Hip-Hop';
    else if (/indie/i.test(text)) intent.genre = 'Indie';

    // Detect Language
    if (/hindi|bollywood|desi/i.test(text)) intent.language = 'Hindi';
    else if (/instrumental|no lyrics|beats only/i.test(text)) intent.language = 'Instrumental';
    else if (/english/i.test(text)) intent.language = 'English';

    // Construct search filter
    const filter: Record<string, any> = {};
    if (intent.mood) filter.mood = new RegExp(intent.mood, 'i');
    if (intent.genre) filter.genre = new RegExp(intent.genre, 'i');
    if (intent.language) filter.language = new RegExp(intent.language, 'i');

    let songs = await Song.find(filter)
      .populate('artist', 'name image')
      .populate('album', 'title coverUrl')
      .sort({ playCount: -1 })
      .limit(15);

    // If too specific, fallback to broad keyword search
    if (songs.length === 0) {
      songs = await Song.find({
        $or: [
          { title: { $regex: text, $options: 'i' } },
          { artistName: { $regex: text, $options: 'i' } },
          { genre: { $regex: text, $options: 'i' } },
          { mood: { $regex: text, $options: 'i' } },
        ],
      })
        .populate('artist', 'name image')
        .limit(10);
    }

    return sendResponse({
      res,
      data: {
        originalQuery: query,
        detectedIntent: intent,
        songs,
      },
    });
  } catch (err) {
    next(err);
  }
};
