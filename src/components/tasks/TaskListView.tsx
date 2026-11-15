import React from 'react';
import { Calendar, CheckSquare } from 'lucide-react';
import { Task } from '@/types/task.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
}) => {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No tasks found"
        description="There are no tasks matching your current view or filter."
        actionLabel={onAddTask ? 'Create Task' : undefined}
        onAction={onAddTask}
      />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Key</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {tasks.map((task) => (
              <tr
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="cursor-pointer transition-colors hover:bg-muted/40 group"
              >
                <td className="py-3 px-4 font-mono text-xs font-bold text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {task.taskKey}
                </td>
                <td className="py-3 px-4 font-medium text-foreground max-w-xs truncate">
                  {task.title}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={task.status} />
                </td>
                <td className="py-3 px-4">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="py-3 px-4">
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={task.assignee.name}
                        avatarUrl={task.assignee.avatarUrl}
                        size="xs"
                      />
                      <span className="text-xs text-foreground truncate max-w-[120px]">
                        {task.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {task.dueDate ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(task.dueDate)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {formatDate(task.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
