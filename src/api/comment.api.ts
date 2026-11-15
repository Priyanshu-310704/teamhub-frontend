import apiClient from './axios';
import { Comment, CommentRequest } from '@/types/comment.types';

export const commentApi = {
  addComment: async (taskId: string, data: CommentRequest): Promise<Comment> => {
    const response = await apiClient.post<Comment>(`/tasks/${taskId}/comments`, data);
    return response.data;
  },

  getTaskComments: async (taskId: string): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/tasks/${taskId}/comments`);
    return response.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },
};
