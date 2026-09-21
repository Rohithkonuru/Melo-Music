import { Request, Response, NextFunction } from 'express';
import { Song, Artist, Album, Playlist } from '../models';
import { sendResponse } from '../utils/apiResponse';

// @desc    Global search across songs, artists, albums, and playlists
// @route   GET /api/search
export const searchGlobal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string || '').trim();
    const type = req.query.type as string; // 'all' | 'songs' | 'artists' | 'albums' | 'playlists'
    const genre = req.query.genre as string;
    const mood = req.query.mood as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query && !genre && !mood) {
      return sendResponse({
        res,
        data: { songs: [], artists: [], albums: [], playlists: [] },
      });
    }

    const regex = query ? new RegExp(query, 'i') : null;

    // Filter for songs
    const songFilter: Record<string, any> = {};
    if (regex) {
      songFilter.$or = [
        { title: regex },
        { artistName: regex },
        { genre: regex },
        { mood: regex },
      ];
    }
    if (genre && genre !== 'All') {
      songFilter.genre = { $regex: new RegExp(`^${genre}$`, 'i') };
    }
    if (mood && mood !== 'All') {
      songFilter.mood = { $regex: new RegExp(`^${mood}$`, 'i') };
    }

    const results: Record<string, any> = {
      songs: [],
      artists: [],
      albums: [],
      playlists: [],
    };

    const tasks: Promise<any>[] = [];

    if (!type || type === 'all' || type === 'songs') {
      tasks.push(
        Song.find(songFilter)
          .populate('artist', 'name image')
          .sort({ playCount: -1 })
          .limit(limit)
          .then((docs) => (results.songs = docs))
      );
    }

    if ((!type || type === 'all' || type === 'artists') && regex) {
      tasks.push(
        Artist.find({
          $or: [{ name: regex }, { bio: regex }, { genres: regex }],
        })
          .sort({ followers: -1 })
          .limit(limit)
          .then((docs) => (results.artists = docs))
      );
    }

    if ((!type || type === 'all' || type === 'albums') && regex) {
      tasks.push(
        Album.find({
          $or: [{ title: regex }, { artistName: regex }],
        })
          .populate('artist', 'name image')
          .limit(limit)
          .then((docs) => (results.albums = docs))
      );
    }

    if ((!type || type === 'all' || type === 'playlists') && regex) {
      tasks.push(
        Playlist.find({
          isPublic: true,
          $or: [{ name: regex }, { description: regex }],
        })
          .populate('owner', 'name avatar')
          .limit(limit)
          .then((docs) => (results.playlists = docs))
      );
    }

    await Promise.all(tasks);

    return sendResponse({
      res,
      data: results,
      meta: {
        query,
        counts: {
          songs: results.songs.length,
          artists: results.artists.length,
          albums: results.albums.length,
          playlists: results.playlists.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get autocomplete suggestions for search bar
// @route   GET /api/search/suggestions
export const getSearchSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      return sendResponse({ res, data: [] });
    }

    const regex = new RegExp(query, 'i');

    const [songs, artists] = await Promise.all([
      Song.find({ title: regex }).select('title artistName coverUrl').limit(5),
      Artist.find({ name: regex }).select('name image').limit(3),
    ]);

    const suggestions = [
      ...songs.map((s) => ({ id: s._id, title: s.title, subtitle: s.artistName, type: 'song', image: s.coverUrl })),
      ...artists.map((a) => ({ id: a._id, title: a.name, subtitle: 'Artist', type: 'artist', image: a.image })),
    ];

    return sendResponse({
      res,
      data: suggestions,
    });
  } catch (err) {
    next(err);
  }
};
