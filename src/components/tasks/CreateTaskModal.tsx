import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { TaskPriority, TaskStatus } from '@/types/task.types';
import { AiTaskDraftModal } from './AiTaskDraftModal';

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters')
    .optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  projectId: string;
  teamMembers?: TeamMember[];
  defaultStatus?: TaskStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  projectId,
  teamMembers = [],
  defaultStatus = 'TODO',
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: defaultStatus,
      priority: 'MEDIUM',
      assigneeId: 'UNASSIGNED',
      dueDate: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateTaskFormData) =>
      taskApi.createTask(projectId, {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId === 'UNASSIGNED' || !data.assigneeId ? undefined : data.assigneeId,
        dueDate: data.dueDate ? data.dueDate : undefined,
      }),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!', {
        description: `Task ${task.taskKey}: "${task.title}" has been added.`,
      });
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to create task', {
        description: getErrorMessage(error),
      });
    },
  });

  const onSubmit = (data: CreateTaskFormData) => {
    mutation.mutate(data);
  };

  const handleApplyAiDraft = (draft: {
    title: string;
    description: string;
    priority: TaskPriority;
  }) => {
    setValue('title', draft.title);
    setValue('description', draft.description);
    setValue('priority', draft.priority);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Create New Task</DialogTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAiModalOpen(true)}
                className="gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Draft with AI
              </Button>
            </div>
            <DialogDescription>
              Add an action item with status, priority, and team assignee.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                placeholder="e.g., Integrate OAuth2 authorization endpoint"
                disabled={mutation.isPending}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="task-status">Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={mutation.isPending}
                    >
                      <SelectTrigger id="task-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="IN_REVIEW">In Review</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-priority">Priority *</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={mutation.isPending}
                    >
                      <SelectTrigger id="task-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Controller
                  name="assigneeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={mutation.isPending}
                    >
                      <SelectTrigger id="task-assignee">
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
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  disabled={mutation.isPending}
                  {...register('dueDate')}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                placeholder="Details, technical specifications, or steps to reproduce..."
                rows={4}
                disabled={mutation.isPending}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="gap-2">
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Spring AI Assistant Modal */}
      <AiTaskDraftModal
        projectId={projectId}
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        onApplyDraft={handleApplyAiDraft}
      />
    </>
  );
};
