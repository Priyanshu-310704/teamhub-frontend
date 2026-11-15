import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CheckSquare,
  Search,
  Kanban,
  List as ListIcon,
  Filter,
} from 'lucide-react';
import { teamApi } from '@/api/team.api';
import { projectApi } from '@/api/project.api';
import { taskApi } from '@/api/task.api';
import { getErrorMessage } from '@/api/axios';
import { useAuthStore } from '@/store/auth.store';
import { Task, TaskPriority, TaskStatus } from '@/types/task.types';
import { PageHeader } from '@/components/common/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskKanbanView } from '@/components/tasks/TaskKanbanView';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

export const MyTasksPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');

  // 1. Fetch user's teams
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamApi.getMyTeams(),
  });

  // 2. Fetch projects
  const { data: allProjects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['all-projects', teams.map((t) => t.id)],
    queryFn: async () => {
      if (teams.length === 0) return [];
      const projectPromises = teams.map((t) => projectApi.getTeamProjects(t.id));
      const results = await Promise.all(projectPromises);
      return results.flat();
    },
    enabled: teams.length > 0,
  });

  // 3. Fetch tasks across all projects
  const { data: allTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['all-my-tasks', allProjects.map((p) => p.id)],
    queryFn: async () => {
      if (allProjects.length === 0) return [];
      const taskPromises = allProjects.map((p) => taskApi.getProjectTasks(p.id));
      const results = await Promise.all(taskPromises);
      return results.flat();
    },
    enabled: allProjects.length > 0,
  });

  // Filter for tasks assigned to current user
  const myAssignedTasks = allTasks.filter(
    (t) => t.assignee && user && t.assignee.id === user.id
  );

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) =>
      taskApi.updateTask(taskId, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast.success('Task status updated');
    },
    onError: (err) => {
      toast.error('Failed to update status', {
        description: getErrorMessage(err),
      });
    },
  });

  const isLoading = isLoadingTeams || isLoadingProjects || isLoadingTasks;

  const filteredTasks = myAssignedTasks.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(q) ||
      t.taskKey.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' || t.status === (statusFilter as TaskStatus);

    const matchesPriority =
      priorityFilter === 'ALL' || t.priority === (priorityFilter as TaskPriority);

    const matchesProject =
      projectFilter === 'ALL' || t.projectId === projectFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="My Tasks"
        description="All action items assigned to you across all teams and projects."
      />

      {/* Filter and View toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="w-32">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-32">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {allProjects.length > 0 && (
            <div className="w-40">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Projects</SelectItem>
                  {allProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1">
          <Button
            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>Kanban</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <ListIcon className="h-3.5 w-3.5" />
            <span>List</span>
          </Button>
        </div>
      </div>

      {/* Task Board / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      ) : myAssignedTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks assigned to you"
          description="When teammates assign tasks to you across projects, they will appear right here."
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks match your filters"
          description="Try adjusting your status or priority filters above."
        />
      ) : viewMode === 'kanban' ? (
        <TaskKanbanView
          tasks={filteredTasks}
          onTaskClick={(task) => setSelectedTaskId(task.id)}
          onStatusChange={(taskId, newStatus) =>
            updateStatusMutation.mutate({ taskId, newStatus })
          }
        />
      ) : (
        <TaskListView
          tasks={filteredTasks}
          onTaskClick={(task) => setSelectedTaskId(task.id)}
        />
      )}

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        open={!!selectedTaskId}
        onOpenChange={(op) => !op && setSelectedTaskId(null)}
      />
    </div>
  );
};
