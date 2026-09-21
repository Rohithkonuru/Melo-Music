import { api } from './api';
import { Song, ListeningHistoryItem } from '../types';

export const userService = {
  getFavorites: async (): Promise<Song[]> => {
    const res = await api.get('/users/favorites');
    return res.data.data;
  },

  toggleFavorite: async (songId: string): Promise<{ isLiked: boolean; songLikeCount: number }> => {
    const res = await api.post(`/users/favorites/${songId}`);
    return res.data.data;
  },

  getHistory: async (limit = 30): Promise<ListeningHistoryItem[]> => {
    const res = await api.get('/users/history', { params: { limit } });
    return res.data.data;
  },

  recordHistory: async (songId: string, durationPlayed?: number): Promise<void> => {
    try {
      await api.post('/users/history', { songId, durationPlayed });
    } catch (e) {
      console.warn('Failed to record history', e);
    }
  },

  toggleFollowArtist: async (artistId: string): Promise<{ isFollowing: boolean; artistFollowers: number }> => {
    const res = await api.post(`/users/follow-artist/${artistId}`);
    return res.data.data;
  },
};
