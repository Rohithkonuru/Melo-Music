import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Playlist, Song, User } from '../models';
import { sendResponse } from '../utils/apiResponse';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

// @desc    Get public playlists (or filtered by user)
// @route   GET /api/playlists
export const getPlaylists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const userId = req.query.userId as string;
    const search = req.query.search as string;

    const filter: Record<string, any> = {};

    if (userId) {
      filter.owner = userId;
    } else {
      filter.isPublic = true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [playlists, total] = await Promise.all([
      Playlist.find(filter)
        .populate('owner', 'name avatar')
        .populate({
          path: 'songs',
          select: 'title duration audioUrl coverUrl artistName genre mood',
          populate: { path: 'artist', select: 'name image' },
        })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Playlist.countDocuments(filter),
    ]);

    return sendResponse({
      res,
      data: playlists,
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

// @desc    Get playlist by ID
// @route   GET /api/playlists/:id
export const getPlaylistById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('owner', 'name avatar email')
      .populate({
        path: 'songs',
        populate: { path: 'artist', select: 'name image' },
      });

    if (!playlist) {
      throw new NotFoundError(`Playlist with id ${req.params.id} not found`);
    }

    return sendResponse({
      res,
      data: playlist,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new playlist
// @route   POST /api/playlists
export const createPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, coverUrl, isPublic, songIds } = req.body;
    if (!name) {
      throw new BadRequestError('Playlist name is required');
    }

    // Default owner fallback to the first user if not authenticated in testing, or req.user.id in auth
    const ownerId = (req as any).user?.id || (await User.findOne())?._id;

    if (!ownerId) {
      throw new BadRequestError('User owner is required to create a playlist');
    }

    const playlist = await Playlist.create({
      name,
      description: description || '',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop',
      owner: ownerId,
      songs: Array.isArray(songIds) ? songIds : [],
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    const populated = await Playlist.findById(playlist._id)
      .populate('owner', 'name avatar')
      .populate('songs');

    return sendResponse({
      res,
      statusCode: 201,
      message: 'Playlist created successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update playlist
// @route   PUT /api/playlists/:id
export const updatePlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      throw new NotFoundError(`Playlist with id ${req.params.id} not found`);
    }

    const currentUserId = (req as any).user?.id;
    const currentUserRole = (req as any).user?.role;
    if (currentUserId && playlist.owner.toString() !== currentUserId && currentUserRole !== 'admin') {
      throw new ForbiddenError('You are not authorized to update this playlist');
    }

    const updated = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name avatar')
      .populate('songs');

    return sendResponse({
      res,
      message: 'Playlist updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
export const deletePlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      throw new NotFoundError(`Playlist with id ${req.params.id} not found`);
    }

    const currentUserId = (req as any).user?.id;
    const currentUserRole = (req as any).user?.role;
    if (currentUserId && playlist.owner.toString() !== currentUserId && currentUserRole !== 'admin') {
      throw new ForbiddenError('You are not authorized to delete this playlist');
    }

    await Playlist.findByIdAndDelete(req.params.id);

    return sendResponse({
      res,
      message: 'Playlist deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
export const addSongToPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { songId } = req.body;
    if (!songId) {
      throw new BadRequestError('songId is required');
    }

    const song = await Song.findById(songId);
    if (!song) {
      throw new NotFoundError(`Song with id ${songId} not found`);
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      throw new NotFoundError(`Playlist with id ${req.params.id} not found`);
    }

    // Avoid duplicate entries
    const exists = playlist.songs.some((s) => s.toString() === songId);
    if (!exists) {
      playlist.songs.push(new mongoose.Types.ObjectId(songId));
      await playlist.save();
    }

    const populated = await Playlist.findById(playlist._id)
      .populate('owner', 'name avatar')
      .populate({
        path: 'songs',
        populate: { path: 'artist', select: 'name' },
      });

    return sendResponse({
      res,
      message: 'Song added to playlist',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
export const removeSongFromPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { songId } = req.params;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      throw new NotFoundError(`Playlist with id ${req.params.id} not found`);
    }

    playlist.songs = playlist.songs.filter((s) => s.toString() !== songId);
    await playlist.save();

    const populated = await Playlist.findById(playlist._id)
      .populate('owner', 'name avatar')
      .populate('songs');

    return sendResponse({
      res,
      message: 'Song removed from playlist',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reorder songs in playlist
// @route   PUT /api/playlists/:id/reorder
export const reorderPlaylistSongs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { songIds } = req.body;
    if (!Array.isArray(songIds)) {
      throw new BadRequestError('songIds must be an array of song IDs');
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      throw new NotFoundError(`Playlist with id ${req.params.id} not found`);
    }

    playlist.songs = songIds.map((id: string) => new mongoose.Types.ObjectId(id));
    await playlist.save();

    const populated = await Playlist.findById(playlist._id)
      .populate('owner', 'name avatar')
      .populate('songs');

    return sendResponse({
      res,
      message: 'Playlist songs reordered successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};
