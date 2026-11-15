import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar,
  Trash2,
  Sparkles,
  Loader2,
  Clock,
  User,
  CheckCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { taskApi } from '@/api/task.api';
import { getErrorMessage } from '@/api/axios';
import { TeamMember } from '@/types/team.types';
import { Task, TaskPriority, TaskStatus } from '@/types/task.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { CommentSection } from '@/components/comments/CommentSection';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AiTaskSummaryModal } from './AiTaskSummaryModal';
import { formatDate, formatDateTime } from '@/lib/utils';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface TaskDetailDrawerProps {
  taskId: string | null;
  teamMembers?: TeamMember[];
  canDelete?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskDeleted?: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  taskId,
  teamMembers = [],
  canDelete = true,
  open,
  onOpenChange,
  onTaskDeleted,
}) => {
  const queryClient = useQueryClient();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => (taskId ? taskApi.getTaskById(taskId) : null),
    enabled: !!taskId && open,
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate || '');
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof taskApi.updateTask>[1]) =>
      taskApi.updateTask(taskId!, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks', updated.projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated');
    },
    onError: (error) => {
      toast.error('Failed to update task', {
        description: getErrorMessage(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => taskApi.deleteTask(taskId!),
    onSuccess: () => {
      if (task) {
        queryClient.invalidateQueries({ queryKey: ['project-tasks', task.projectId] });
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
      setDeleteConfirmOpen(false);
      onOpenChange(false);
      if (onTaskDeleted) onTaskDeleted();
    },
    onError: (error) => {
      toast.error('Failed to delete task', {
        description: getErrorMessage(error),
      });
    },
  });

  if (!taskId) return null;

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (task && title.trim() && title.trim() !== task.title) {
      updateMutation.mutate({ title: title.trim() });
    }
  };

  const handleStatusChange = (status: string) => {
    updateMutation.mutate({ status: status as TaskStatus });
  };

  const handlePriorityChange = (priority: string) => {
    updateMutation.mutate({ priority: priority as TaskPriority });
  };

  const handleAssigneeChange = (assigneeVal: string) => {
    if (assigneeVal === 'UNASSIGNED') {
      updateMutation.mutate({ unassign: true });
    } else {
      updateMutation.mutate({ assigneeId: assigneeVal });
    }
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDueDate(newDate);
    updateMutation.mutate({ dueDate: newDate || undefined });
  };

  const handleDescriptionBlur = () => {
    if (task && description !== (task.description || '')) {
      updateMutation.mutate({ description });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-6">
          {isLoading || !task ? (
            <div className="py-16">
              <LoadingSpinner size="lg" label="Loading task details..." />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header row: Key, AI summary, Delete */}
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {task.taskKey}
                  </span>
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAiSummaryOpen(true)}
                    className="gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Summary
                  </Button>

                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Editable Title */}
              <div>
                {isEditingTitle ? (
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleBlur();
                    }}
                    autoFocus
                    className="text-lg font-bold"
                  />
                ) : (
                  <h2
                    onClick={() => setIsEditingTitle(true)}
                    className="text-xl font-bold tracking-tight text-foreground hover:bg-muted/50 p-1.5 rounded-lg cursor-text transition-colors"
                    title="Click to edit title"
                  >
                    {task.title}
                  </h2>
                )}
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card/60 p-4 sm:grid-cols-4">
                {/* Status */}
                <div className="space-y-1">
                  <Label className="text-[10px]">Status</Label>
                  <Select value={task.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="IN_REVIEW">In Review</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <Label className="text-[10px]">Priority</Label>
                  <Select value={task.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee */}
                <div className="space-y-1">
                  <Label className="text-[10px]">Assignee</Label>
                  <Select
                    value={task.assignee?.id || 'UNASSIGNED'}
                    onValueChange={handleAssigneeChange}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                  <Label className="text-[10px]">Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={handleDueDateChange}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="detail-desc" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="detail-desc"
                  placeholder="Add detailed task notes, acceptance criteria, or logs..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  className="text-xs leading-relaxed"
                />
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>Reporter: {task.reporter.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Created {formatDateTime(task.createdAt)}</span>
                </div>
              </div>

              {/* Discussion & Comments */}
              <CommentSection taskId={task.id} canModerate={canDelete} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Task Deletion */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Task"
        description={`Are you sure you want to delete ${task?.taskKey}: "${task?.title}"? All associated comments will also be permanently deleted.`}
        confirmLabel="Delete Task"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />

      {/* Spring AI Summary Modal */}
      {task && (
        <AiTaskSummaryModal
          taskId={task.id}
          taskTitle={task.title}
          open={aiSummaryOpen}
          onOpenChange={setAiSummaryOpen}
        />
      )}
    </>
  );
};
