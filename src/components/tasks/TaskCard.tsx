import React from 'react';
import { Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { Task } from '@/types/task.types';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  isDragging = false,
}) => {
  const isOverdue =
    task.dueDate &&
    task.status !== 'DONE' &&
    new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-lg border border-border bg-card p-3.5 shadow-sm transition-all duration-150 hover:border-indigo-500/40 hover:shadow-md select-none',
        isDragging && 'shadow-xl ring-2 ring-indigo-500/40 rotate-1'
      )}
    >
      {/* Header: Key & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-[11px] font-semibold text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {task.taskKey}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-3">
        {task.title}
      </h4>

      {/* Footer: Due date & Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-1 text-[11px]',
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-muted-foreground'
              )}
              title={isOverdue ? 'Task is overdue' : 'Due date'}
            >
              {isOverdue ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>{formatDate(task.dueDate)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.assignee ? (
            <UserAvatar
              name={task.assignee.name}
              avatarUrl={task.assignee.avatarUrl}
              size="xs"
            />
          ) : (
            <span className="text-[10px] text-muted-foreground italic">
              Unassigned
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
