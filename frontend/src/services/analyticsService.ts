import { api } from './api';
import { UserAnalytics, AdminAnalytics } from '../types';

export const analyticsService = {
  getUserAnalytics: async (): Promise<UserAnalytics> => {
    const res = await api.get('/analytics/user');
    return res.data.data;
  },

  getAdminAnalytics: async (): Promise<AdminAnalytics> => {
    const res = await api.get('/analytics/admin');
    return res.data.data;
  },
};
