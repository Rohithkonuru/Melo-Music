import { Request, Response, NextFunction } from 'express';
import { Song, Artist } from '../models';
import { sendResponse } from '../utils/apiResponse';
import { NotFoundError, BadRequestError } from '../utils/errors';

// @desc    Get all songs with filtering, searching, pagination, and sorting
// @route   GET /api/songs
export const getSongs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { genre, mood, language, artist, search, sort } = req.query;

    const filter: Record<string, any> = {};

    if (genre && genre !== 'All') {
      filter.genre = { $regex: new RegExp(`^${genre}$`, 'i') };
    }
    if (mood && mood !== 'All') {
      filter.mood = { $regex: new RegExp(`^${mood}$`, 'i') };
    }
    if (language && language !== 'All') {
      filter.language = { $regex: new RegExp(`^${language}$`, 'i') };
    }
    if (artist) {
      filter.artist = artist;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { artistName: { $regex: search as string, $options: 'i' } },
        { genre: { $regex: search as string, $options: 'i' } },
        { mood: { $regex: search as string, $options: 'i' } },
      ];
    }

    let sortOption: Record<string, any> = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { playCount: -1 };
    } else if (sort === 'likes') {
      sortOption = { likeCount: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    const [songs, total] = await Promise.all([
      Song.find(filter)
        .populate('artist', 'name image')
        .populate('album', 'title coverUrl')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Song.countDocuments(filter),
    ]);

    return sendResponse({
      res,
      data: songs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get trending songs ordered by play count
// @route   GET /api/songs/trending
export const getTrendingSongs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const songs = await Song.find()
      .populate('artist', 'name image')
      .sort({ playCount: -1 })
      .limit(limit);

    return sendResponse({
      res,
      data: songs,
      message: 'Trending songs retrieved successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get new releases ordered by release date
// @route   GET /api/songs/new-releases
export const getNewReleases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const songs = await Song.find()
      .populate('artist', 'name image')
      .sort({ releaseDate: -1, createdAt: -1 })
      .limit(limit);

    return sendResponse({
      res,
      data: songs,
      message: 'New releases retrieved successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single song by ID
// @route   GET /api/songs/:id
export const getSongById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('artist', 'name bio image genres followers')
      .populate('album', 'title coverUrl releaseDate');

    if (!song) {
      throw new NotFoundError(`Song with id ${req.params.id} not found`);
    }

    return sendResponse({
      res,
      data: song,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new song
// @route   POST /api/songs
export const createSong = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, artistId, genre, duration, audioUrl, coverUrl, mood, language, albumId } = req.body;

    if (!title || !artistId || !genre || !duration || !audioUrl || !coverUrl || !mood) {
      throw new BadRequestError('Please provide all required fields: title, artistId, genre, duration, audioUrl, coverUrl, mood');
    }

    const artistDoc = await Artist.findById(artistId);
    if (!artistDoc) {
      throw new NotFoundError(`Artist with id ${artistId} not found`);
    }

    const song = await Song.create({
      title,
      artist: artistDoc._id,
      artistName: artistDoc.name,
      genre,
      duration: Number(duration),
      audioUrl,
      coverUrl,
      mood,
      language: language || 'English',
      album: albumId || undefined,
    });

    return sendResponse({
      res,
      statusCode: 201,
      message: 'Song created successfully',
      data: song,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a song
// @route   PUT /api/songs/:id
export const updateSong = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!song) {
      throw new NotFoundError(`Song with id ${req.params.id} not found`);
    }

    return sendResponse({
      res,
      message: 'Song updated successfully',
      data: song,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a song
// @route   DELETE /api/songs/:id
export const deleteSong = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);

    if (!song) {
      throw new NotFoundError(`Song with id ${req.params.id} not found`);
    }

    return sendResponse({
      res,
      message: 'Song deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Increment play count on song play
// @route   POST /api/songs/:id/play
export const playSong = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { playCount: 1 } },
      { new: true }
    );

    if (!song) {
      throw new NotFoundError(`Song with id ${req.params.id} not found`);
    }

    return sendResponse({
      res,
      data: { id: song._id, playCount: song.playCount },
      message: 'Play recorded',
    });
  } catch (err) {
    next(err);
  }
};
