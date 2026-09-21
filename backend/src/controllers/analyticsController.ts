import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ListeningHistory, Song, User, Artist, Playlist } from '../models';
import { sendResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper to format seconds into "Xh Ym"
const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${Math.floor(totalSeconds % 60)}s`;
};

// @desc    Get personal listening analytics for current user
// @route   GET /api/analytics/user
export const getUserAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;

    // 1. Fetch user's listening history with populated song details
    const history = await ListeningHistory.find({ user: userId })
      .populate({
        path: 'song',
        populate: { path: 'artist', select: 'name' },
      })
      .sort({ playedAt: -1 });

    const totalSeconds = history.reduce((acc, curr) => acc + (curr.durationPlayed || 0), 0);

    // 2. Aggregate Top Genres
    const genreCounts: Record<string, number> = {};
    const artistCounts: Record<string, { name: string; count: number }> = {};
    const songPlayCounts: Record<string, { song: any; count: number }> = {};

    history.forEach((record) => {
      const s = record.song as any;
      if (!s) return;

      // Genre count
      const genre = s.genre || 'Other';
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;

      // Artist count
      const artistName = s.artistName || s.artist?.name || 'Unknown';
      if (!artistCounts[artistName]) {
        artistCounts[artistName] = { name: artistName, count: 0 };
      }
      artistCounts[artistName].count += 1;

      // Song count
      const songId = s._id.toString();
      if (!songPlayCounts[songId]) {
        songPlayCounts[songId] = { song: s, count: 0 };
      }
      songPlayCounts[songId].count += 1;
    });

    const topGenres = Object.entries(genreCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const topArtists = Object.values(artistCounts)
      .map((item) => ({ name: item.name, plays: item.count }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    const mostPlayedSongs = Object.values(songPlayCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item, index) => ({
        rank: index + 1,
        plays: item.count,
        song: item.song,
      }));

    // 3. Activity timeline (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const activityMap: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      activityMap[dayName] = 0;
    }

    history.forEach((record) => {
      const recDate = new Date(record.playedAt);
      const diffDays = Math.floor((now.getTime() - recDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        const dayName = days[recDate.getDay()];
        activityMap[dayName] = (activityMap[dayName] || 0) + 1;
      }
    });

    const activityTimeline = Object.entries(activityMap).map(([day, plays]) => ({
      day,
      plays,
    }));

    return sendResponse({
      res,
      data: {
        totalListeningTimeSeconds: totalSeconds,
        formattedListeningTime: formatDuration(totalSeconds),
        totalSongsPlayed: history.length,
        topGenres,
        topArtists,
        activityTimeline,
        mostPlayedSongs,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get platform-wide admin analytics
// @route   GET /api/analytics/admin
export const getAdminAnalytics = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalSongs,
      totalArtists,
      totalPlaylists,
      totalPlaysAggregate,
    ] = await Promise.all([
      User.countDocuments(),
      Song.countDocuments(),
      Artist.countDocuments(),
      Playlist.countDocuments(),
      Song.aggregate([{ $group: { _id: null, total: { $sum: '$playCount' } } }]),
    ]);

    const totalPlays = totalPlaysAggregate[0]?.total || 0;

    // Platform Top Genres
    const topGenres = await Song.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 }, totalPlays: { $sum: '$playCount' } } },
      { $sort: { totalPlays: -1 } },
      { $limit: 6 },
      { $project: { name: '$_id', value: '$count', plays: '$totalPlays', _id: 0 } },
    ]);

    // Platform Top Songs
    const topSongs = await Song.find()
      .populate('artist', 'name image')
      .sort({ playCount: -1 })
      .limit(6);

    // Mock/Estimated monthly trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const playsOverTime = months.map((month, idx) => ({
      month,
      plays: Math.round(totalPlays * (0.4 + (idx * 0.08))),
      activeUsers: Math.max(2, Math.round(totalUsers * (0.5 + (idx * 0.06)))),
    }));

    return sendResponse({
      res,
      data: {
        metrics: {
          totalUsers,
          totalSongs,
          totalArtists,
          totalPlaylists,
          totalPlays,
          activeUsers: totalUsers,
        },
        topGenres,
        topSongs,
        playsOverTime,
      },
    });
  } catch (err) {
    next(err);
  }
};
