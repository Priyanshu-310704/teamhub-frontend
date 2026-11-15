import { Task, TaskPriority, TaskStatus } from './task.types';

export interface AiTaskDraftRequest {
  prompt: string;
}

export interface AiTaskDraftResponse {
  suggestedTitle: string;
  description: string;
  acceptanceCriteria: string[];
  suggestedPriority: TaskPriority;
}

export interface AiTaskSummaryResponse {
  tldr: string;
  keyDecisions: string[];
  openBlockers: string[];
  nextSteps: string[];
}

export interface AiBoardFilterRequest {
  query: string;
}

export interface AiBoardFilterResponse {
  extractedFilter: {
    status: TaskStatus | null;
    priority: TaskPriority | null;
    searchKeyword: string | null;
  };
  tasks: Task[];
}
