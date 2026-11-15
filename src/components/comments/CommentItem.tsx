import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Comment } from '@/types/comment.types';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatTimeAgo, formatDateTime } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  canModerate?: boolean; // OWNER or ADMIN
  onDelete: (commentId: string) => void;
  isDeleting?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  canModerate = false,
  onDelete,
  isDeleting = false,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isAuthor = currentUserId === comment.authorId;
  const canDelete = isAuthor || canModerate;

  return (
    <div className="flex items-start gap-3 py-3 group">
      <UserAvatar
        name={comment.authorName}
        avatarUrl={comment.authorAvatarUrl}
        size="sm"
        className="mt-0.5"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              {comment.authorName}
            </span>
            <span
              className="text-[11px] text-muted-foreground"
              title={formatDateTime(comment.createdAt)}
            >
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmOpen(true)}
              disabled={isDeleting}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-rose-600"
              title="Delete comment"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {comment.content}
        </p>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={() => {
          onDelete(comment.id);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
};
