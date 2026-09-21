import { Request, Response, NextFunction } from 'express';
import { Artist, Song, Album } from '../models';
import { sendResponse } from '../utils/apiResponse';
import { NotFoundError, BadRequestError } from '../utils/errors';

// @desc    Get artists with pagination and search
// @route   GET /api/artists
export const getArtists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { genres: { $regex: search, $options: 'i' } },
      ];
    }

    const [artists, total] = await Promise.all([
      Artist.find(filter)
        .sort({ followers: -1, name: 1 })
        .skip(skip)
        .limit(limit),
      Artist.countDocuments(filter),
    ]);

    return sendResponse({
      res,
      data: artists,
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

// @desc    Get popular artists
// @route   GET /api/artists/popular
export const getPopularArtists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const artists = await Artist.find()
      .sort({ followers: -1 })
      .limit(limit);

    return sendResponse({
      res,
      data: artists,
      message: 'Popular artists retrieved successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single artist by ID along with their songs and albums
// @route   GET /api/artists/:id
export const getArtistById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      throw new NotFoundError(`Artist with id ${req.params.id} not found`);
    }

    const [songs, albums] = await Promise.all([
      Song.find({ artist: artist._id }).sort({ playCount: -1 }),
      Album.find({ artist: artist._id }).sort({ releaseDate: -1 }),
    ]);

    return sendResponse({
      res,
      data: {
        ...artist.toObject(),
        songs,
        albums,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new artist
// @route   POST /api/artists
export const createArtist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, bio, image, genres } = req.body;
    if (!name || !image) {
      throw new BadRequestError('Artist name and image are required');
    }

    const artist = await Artist.create({
      name,
      bio: bio || '',
      image,
      genres: Array.isArray(genres) ? genres : [genres].filter(Boolean),
    });

    return sendResponse({
      res,
      statusCode: 201,
      message: 'Artist created successfully',
      data: artist,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update artist
// @route   PUT /api/artists/:id
export const updateArtist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!artist) {
      throw new NotFoundError(`Artist with id ${req.params.id} not found`);
    }

    return sendResponse({
      res,
      message: 'Artist updated successfully',
      data: artist,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete artist
// @route   DELETE /api/artists/:id
export const deleteArtist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);
    if (!artist) {
      throw new NotFoundError(`Artist with id ${req.params.id} not found`);
    }

    return sendResponse({
      res,
      message: 'Artist deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
};
