import { api } from './api';
import { Song, Artist, Album, Playlist } from '../types';

export const musicService = {
  // Songs
  getSongs: async (params?: Record<string, any>): Promise<{ data: Song[]; meta: any }> => {
    const res = await api.get('/songs', { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  getTrendingSongs: async (limit = 10): Promise<Song[]> => {
    const res = await api.get('/songs/trending', { params: { limit } });
    return res.data.data;
  },

  getNewReleases: async (limit = 10): Promise<Song[]> => {
    const res = await api.get('/songs/new-releases', { params: { limit } });
    return res.data.data;
  },

  getSongById: async (id: string): Promise<Song> => {
    const res = await api.get(`/songs/${id}`);
    return res.data.data;
  },

  recordPlay: async (id: string): Promise<void> => {
    try {
      await api.post(`/songs/${id}/play`);
    } catch (e) {
      console.warn('Failed to record song play count', e);
    }
  },

  deleteSong: async (id: string): Promise<void> => {
    await api.delete(`/songs/${id}`);
  },

  // Artists
  getArtists: async (params?: Record<string, any>): Promise<{ data: Artist[]; meta: any }> => {
    const res = await api.get('/artists', { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  getPopularArtists: async (limit = 10): Promise<Artist[]> => {
    const res = await api.get('/artists/popular', { params: { limit } });
    return res.data.data;
  },

  getArtistById: async (id: string): Promise<Artist> => {
    const res = await api.get(`/artists/${id}`);
    return res.data.data;
  },

  // Albums
  getAlbums: async (params?: Record<string, any>): Promise<{ data: Album[]; meta: any }> => {
    const res = await api.get('/albums', { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  getAlbumById: async (id: string): Promise<Album> => {
    const res = await api.get(`/albums/${id}`);
    return res.data.data;
  },

  // Playlists
  getPlaylists: async (params?: Record<string, any>): Promise<{ data: Playlist[]; meta: any }> => {
    const res = await api.get('/playlists', { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  getPlaylistById: async (id: string): Promise<Playlist> => {
    const res = await api.get(`/playlists/${id}`);
    return res.data.data;
  },

  createPlaylist: async (data: { name: string; description?: string; coverUrl?: string; isPublic?: boolean }): Promise<Playlist> => {
    const res = await api.post('/playlists', data);
    return res.data.data;
  },

  updatePlaylist: async (id: string, data: Partial<Playlist>): Promise<Playlist> => {
    const res = await api.put(`/playlists/${id}`, data);
    return res.data.data;
  },

  deletePlaylist: async (id: string): Promise<void> => {
    await api.delete(`/playlists/${id}`);
  },

  addSongToPlaylist: async (playlistId: string, songId: string): Promise<Playlist> => {
    const res = await api.post(`/playlists/${playlistId}/songs`, { songId });
    return res.data.data;
  },

  removeSongFromPlaylist: async (playlistId: string, songId: string): Promise<Playlist> => {
    const res = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
    return res.data.data;
  },

  // Search
  searchGlobal: async (query: string, type = 'all', genre?: string, mood?: string) => {
    const res = await api.get('/search', {
      params: { q: query, type, genre, mood },
    });
    return res.data.data;
  },

  getSuggestions: async (query: string) => {
    const res = await api.get('/search/suggestions', { params: { q: query } });
    return res.data.data;
  },
};
