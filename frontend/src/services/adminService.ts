import { api } from './api';
import { User } from '../types';

export const adminService = {
  getUsers: async (params?: Record<string, any>): Promise<{ data: User[]; meta: any }> => {
    const res = await api.get('/admin/users', { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};
