export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string>;
  timestamp?: string;
  rootCause?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string>;
}
