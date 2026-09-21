import { api } from './api';
import { User } from '../types';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  register: async (userData: { name: string; email: string; password: string; confirmPassword?: string }) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  updateProfile: async (profileData: { name?: string; avatar?: string; favoriteGenres?: string[] }): Promise<User> => {
    const res = await api.put('/auth/profile', profileData);
    return res.data.data;
  },
};
