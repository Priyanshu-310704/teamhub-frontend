import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { commentApi } from '@/api/comment.api';
import { getErrorMessage } from '@/api/axios';
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface CommentSectionProps {
  taskId: string;
  canModerate?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  taskId,
  canModerate = false,
}) => {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: () => commentApi.getTaskComments(taskId),
  });

  const addCommentMutation = useMutation({
    mutationFn: (newContent: string) =>
      commentApi.addComment(taskId, { content: newContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      setContent('');
      toast.success('Comment posted');
    },
    onError: (error) => {
      toast.error('Failed to post comment', {
        description: getErrorMessage(error),
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      toast.success('Comment deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete comment', {
        description: getErrorMessage(error),
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addCommentMutation.mutate(content.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (content.trim()) {
        addCommentMutation.mutate(content.trim());
      }
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <MessageSquare className="h-4 w-4 text-indigo-500" />
        <span>Activity & Discussion ({comments.length})</span>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Write a comment... (Press ⌘+Enter to send)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="text-xs resize-none"
          disabled={addCommentMutation.isPending}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || addCommentMutation.isPending}
            className="gap-1.5 h-8 text-xs"
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            Send
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <LoadingSpinner size="sm" label="Loading discussion..." />
      ) : comments.length === 0 ? (
        <p className="text-center py-4 text-xs text-muted-foreground">
          No comments yet. Start the conversation!
        </p>
      ) : (
        <div className="divide-y divide-border/50">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              canModerate={canModerate}
              onDelete={(id) => deleteCommentMutation.mutate(id)}
              isDeleting={deleteCommentMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};
