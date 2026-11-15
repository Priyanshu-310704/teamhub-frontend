import apiClient from './axios';
import { CreateTaskRequest, Task, TaskFilterParams, UpdateTaskRequest } from '@/types/task.types';

export const taskApi = {
  createTask: async (projectId: string, data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post<Task>(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  getProjectTasks: async (projectId: string, params?: TaskFilterParams): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>(`/projects/${projectId}/tasks`, {
      params,
    });
    return response.data;
  },

  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${taskId}`);
    return response.data;
  },

  updateTask: async (taskId: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};
