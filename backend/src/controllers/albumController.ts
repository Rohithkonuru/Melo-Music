import { Request, Response, NextFunction } from 'express';
import { Album, Artist } from '../models';
import { sendResponse } from '../utils/apiResponse';
import { NotFoundError, BadRequestError } from '../utils/errors';

// @desc    Get albums with pagination and search
// @route   GET /api/albums
export const getAlbums = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } },
      ];
    }

    const [albums, total] = await Promise.all([
      Album.find(filter)
        .populate('artist', 'name image')
        .populate('songs', 'title duration audioUrl coverUrl playCount')
        .sort({ releaseDate: -1 })
        .skip(skip)
        .limit(limit),
      Album.countDocuments(filter),
    ]);

    return sendResponse({
      res,
      data: albums,
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

// @desc    Get single album by ID
// @route   GET /api/albums/:id
export const getAlbumById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('artist', 'name bio image genres')
      .populate({
        path: 'songs',
        populate: { path: 'artist', select: 'name' },
      });

    if (!album) {
      throw new NotFoundError(`Album with id ${req.params.id} not found`);
    }

    return sendResponse({
      res,
      data: album,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new album
// @route   POST /api/albums
export const createAlbum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, artistId, coverUrl, releaseDate, songIds } = req.body;
    if (!title || !artistId || !coverUrl) {
      throw new BadRequestError('Album title, artistId, and coverUrl are required');
    }

    const artistDoc = await Artist.findById(artistId);
    if (!artistDoc) {
      throw new NotFoundError(`Artist with id ${artistId} not found`);
    }

    const album = await Album.create({
      title,
      artist: artistDoc._id,
      artistName: artistDoc.name,
      coverUrl,
      releaseDate: releaseDate || new Date(),
      songs: Array.isArray(songIds) ? songIds : [],
    });

    return sendResponse({
      res,
      statusCode: 201,
      message: 'Album created successfully',
      data: album,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update album
// @route   PUT /api/albums/:id
export const updateAlbum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const album = await Album.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!album) {
      throw new NotFoundError(`Album with id ${req.params.id} not found`);
    }

    return sendResponse({
      res,
      message: 'Album updated successfully',
      data: album,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete album
// @route   DELETE /api/albums/:id
export const deleteAlbum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) {
      throw new NotFoundError(`Album with id ${req.params.id} not found`);
    }

    return sendResponse({
      res,
      message: 'Album deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
};
