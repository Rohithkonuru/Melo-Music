import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User, Song, Artist, ListeningHistory } from '../models';
import { sendResponse } from '../utils/apiResponse';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get user liked songs (favorites)
// @route   GET /api/users/favorites
export const getFavorites = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!._id).populate({
      path: 'likedSongs',
      populate: [
        { path: 'artist', select: 'name image' },
        { path: 'album', select: 'title coverUrl' },
      ],
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return sendResponse({
      res,
      data: user.likedSongs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle favorite (like/unlike) on a song
// @route   POST /api/users/favorites/:songId
export const toggleFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { songId } = req.params;
    const song = await Song.findById(songId);
    if (!song) {
      throw new NotFoundError(`Song with id ${songId} not found`);
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isLiked = user.likedSongs.some((id) => id.toString() === songId);

    if (isLiked) {
      user.likedSongs = user.likedSongs.filter((id) => id.toString() !== songId);
      song.likeCount = Math.max(0, song.likeCount - 1);
    } else {
      user.likedSongs.push(new mongoose.Types.ObjectId(songId));
      song.likeCount += 1;
    }

    await Promise.all([user.save(), song.save()]);

    return sendResponse({
      res,
      message: isLiked ? 'Removed from favorites' : 'Added to favorites',
      data: {
        isLiked: !isLiked,
        likedSongsCount: user.likedSongs.length,
        songLikeCount: song.likeCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user listening history
// @route   GET /api/users/history
export const getHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;

    const history = await ListeningHistory.find({ user: req.user!._id })
      .populate({
        path: 'song',
        populate: { path: 'artist', select: 'name image' },
      })
      .sort({ playedAt: -1 })
      .limit(limit);

    return sendResponse({
      res,
      data: history,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record a played song in listening history
// @route   POST /api/users/history
export const recordHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { songId, durationPlayed } = req.body;
    if (!songId) {
      throw new BadRequestError('songId is required');
    }

    const song = await Song.findById(songId);
    if (!song) {
      throw new NotFoundError(`Song with id ${songId} not found`);
    }

    // 1. Create ListeningHistory entry
    const historyEntry = await ListeningHistory.create({
      user: req.user!._id,
      song: song._id,
      playedAt: new Date(),
      durationPlayed: Number(durationPlayed) || song.duration,
    });

    // 2. Prepend to user's recentlyPlayed array (keep max 30 items)
    const user = await User.findById(req.user!._id);
    if (user) {
      user.recentlyPlayed = user.recentlyPlayed.filter(
        (entry) => entry.song.toString() !== songId
      );
      user.recentlyPlayed.unshift({
        song: song._id as mongoose.Types.ObjectId,
        playedAt: new Date(),
      });
      if (user.recentlyPlayed.length > 30) {
        user.recentlyPlayed = user.recentlyPlayed.slice(0, 30);
      }
      await user.save();
    }

    // 3. Increment song play count
    song.playCount += 1;
    await song.save();

    return sendResponse({
      res,
      statusCode: 201,
      message: 'Listening history recorded',
      data: historyEntry,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Follow / Unfollow an artist
// @route   POST /api/users/follow-artist/:artistId
export const toggleFollowArtist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { artistId } = req.params;
    const artist = await Artist.findById(artistId);
    if (!artist) {
      throw new NotFoundError(`Artist with id ${artistId} not found`);
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isFollowing = user.followedArtists.some((id) => id.toString() === artistId);

    if (isFollowing) {
      user.followedArtists = user.followedArtists.filter((id) => id.toString() !== artistId);
      artist.followers = Math.max(0, artist.followers - 1);
    } else {
      user.followedArtists.push(new mongoose.Types.ObjectId(artistId));
      artist.followers += 1;
    }

    await Promise.all([user.save(), artist.save()]);

    return sendResponse({
      res,
      message: isFollowing ? 'Unfollowed artist' : 'Followed artist',
      data: {
        isFollowing: !isFollowing,
        artistFollowers: artist.followers,
      },
    });
  } catch (err) {
    next(err);
  }
};
