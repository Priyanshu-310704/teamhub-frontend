import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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
import { projectApi } from '@/api/project.api';
import { getErrorMessage } from '@/api/axios';
import { Team } from '@/types/team.types';
import { ProjectStatus } from '@/types/project.types';

const createProjectSchema = z.object({
  teamId: z.string().min(1, 'Please select a team'),
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(120, 'Project name must be at most 120 characters'),
  projectKey: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key must be at most 10 characters')
    .regex(
      /^[A-Z][A-Z0-9]{1,9}$/,
      'Must start with an uppercase letter followed by uppercase letters or numbers (e.g., TH, CORE)'
    ),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
  teams: Team[];
  defaultTeamId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (projectId: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  teams,
  defaultTeamId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      teamId: defaultTeamId || (teams[0]?.id ?? ''),
      name: '',
      projectKey: '',
      description: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (defaultTeamId) {
      setValue('teamId', defaultTeamId);
    } else if (teams.length > 0 && !watch('teamId')) {
      setValue('teamId', teams[0].id);
    }
  }, [defaultTeamId, teams, setValue, watch]);

  // Auto-generate project key from name if not manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('name', val);
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      let candidate = '';
      if (words.length === 1) {
        candidate = words[0].slice(0, 4).toUpperCase();
      } else {
        candidate = words.map((w) => w[0]).join('').slice(0, 5).toUpperCase();
      }
      candidate = candidate.replace(/[^A-Z0-9]/g, '');
      if (/^[A-Z]/.test(candidate)) {
        setValue('projectKey', candidate);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: (data: CreateProjectFormData) =>
      projectApi.createProject(data.teamId, {
        name: data.name,
        projectKey: data.projectKey,
        description: data.description,
        status: data.status as ProjectStatus,
      }),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['team-projects', project.teamId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully!', {
        description: `Project "${project.name}" (${project.projectKey}) has been created.`,
      });
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess(project.id);
    },
    onError: (error) => {
      toast.error('Failed to create project', {
        description: getErrorMessage(error),
      });
    },
  });

  const onSubmit = (data: CreateProjectFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Organize tasks, milestones, and deliverables under a team workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Team Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="project-team">Owning Team *</Label>
            <Controller
              name="teamId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={mutation.isPending || !!defaultTeamId}
                >
                  <SelectTrigger id="project-team">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.myRole})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.teamId && (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {errors.teamId.message}
              </p>
            )}
          </div>

          {/* Project Name */}
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              placeholder="e.g., Mobile Application V2"
              disabled={mutation.isPending}
              {...register('name', { onChange: handleNameChange })}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Project Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="project-key">Project Key *</Label>
              <span className="text-[11px] text-muted-foreground">
                Prefix for tasks (e.g. CORE-1)
              </span>
            </div>
            <Input
              id="project-key"
              placeholder="e.g., MAPP, CORE, TH"
              className="font-mono uppercase"
              disabled={mutation.isPending}
              {...register('projectKey')}
            />
            {errors.projectKey && (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {errors.projectKey.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="project-status">Initial Status *</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger id="project-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="project-desc">Description</Label>
            <Textarea
              id="project-desc"
              placeholder="Summary of project goals, deliverables, and scope..."
              rows={3}
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
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
