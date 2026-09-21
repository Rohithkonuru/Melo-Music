import { api } from './api';
import { RecommendationResponse, NLPSearchResult, Song } from '../types';

export const aiService = {
  getRecommendations: async (limit = 12): Promise<RecommendationResponse> => {
    const res = await api.get('/recommendations', { params: { limit } });
    return res.data.data;
  },

  generateMoodPlaylist: async (params: {
    mood: string;
    genre?: string;
    language?: string;
    count?: number;
  }): Promise<{ mood: string; genre: string; total: number; songs: Song[] }> => {
    const res = await api.post('/recommendations/mood-playlist', params);
    return res.data.data;
  },

  naturalLanguageSearch: async (query: string): Promise<NLPSearchResult> => {
    const res = await api.post('/recommendations/natural-search', { query });
    return res.data.data;
  },
};
