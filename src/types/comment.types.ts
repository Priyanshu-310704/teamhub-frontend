export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRequest {
  content: string;
}
