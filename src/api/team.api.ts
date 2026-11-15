import apiClient from './axios';
import { AddTeamMemberRequest, CreateTeamRequest, Team, TeamMember } from '@/types/team.types';

export const teamApi = {
  createTeam: async (data: CreateTeamRequest): Promise<Team> => {
    const response = await apiClient.post<Team>('/teams', data);
    return response.data;
  },

  getMyTeams: async (): Promise<Team[]> => {
    const response = await apiClient.get<Team[]>('/teams');
    return response.data;
  },

  getTeamById: async (teamId: string): Promise<Team> => {
    const response = await apiClient.get<Team>(`/teams/${teamId}`);
    return response.data;
  },

  addMember: async (teamId: string, data: AddTeamMemberRequest): Promise<TeamMember> => {
    const response = await apiClient.post<TeamMember>(`/teams/${teamId}/members`, data);
    return response.data;
  },

  getTeamMembers: async (teamId: string): Promise<TeamMember[]> => {
    const response = await apiClient.get<TeamMember[]>(`/teams/${teamId}/members`);
    return response.data;
  },

  removeMember: async (teamId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  },
};
