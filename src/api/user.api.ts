import apiClient from './axios';
import { User } from '@/types/user.types';

export const userApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },
};
