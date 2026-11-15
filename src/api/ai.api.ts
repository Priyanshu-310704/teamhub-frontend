import apiClient from './axios';
import {
  AiBoardFilterRequest,
  AiBoardFilterResponse,
  AiTaskDraftRequest,
  AiTaskDraftResponse,
  AiTaskSummaryResponse,
} from '@/types/ai.types';

export const aiApi = {
  generateTaskDraft: async (projectId: string, data: AiTaskDraftRequest): Promise<AiTaskDraftResponse> => {
    const response = await apiClient.post<AiTaskDraftResponse>(
      `/projects/${projectId}/ai/task-draft`,
      data
    );
    return response.data;
  },

  summarizeTaskDiscussion: async (taskId: string): Promise<AiTaskSummaryResponse> => {
    const response = await apiClient.post<AiTaskSummaryResponse>(
      `/tasks/${taskId}/ai/summarize`
    );
    return response.data;
  },

  filterBoardByNaturalLanguage: async (
    projectId: string,
    data: AiBoardFilterRequest
  ): Promise<AiBoardFilterResponse> => {
    const response = await apiClient.post<AiBoardFilterResponse>(
      `/projects/${projectId}/ai/filter-tasks`,
      data
    );
    return response.data;
  },
};
