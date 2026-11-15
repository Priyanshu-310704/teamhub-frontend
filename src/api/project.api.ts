import apiClient from './axios';
import { CreateProjectRequest, Project, UpdateProjectRequest } from '@/types/project.types';

export const projectApi = {
  createProject: async (teamId: string, data: CreateProjectRequest): Promise<Project> => {
    const response = await apiClient.post<Project>(`/teams/${teamId}/projects`, data);
    return response.data;
  },

  getTeamProjects: async (teamId: string): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>(`/teams/${teamId}/projects`);
    return response.data;
  },

  getProjectById: async (projectId: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${projectId}`);
    return response.data;
  },

  updateProject: async (projectId: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await apiClient.patch<Project>(`/projects/${projectId}`, data);
    return response.data;
  },

  deleteProject: async (projectId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}`);
  },
};
