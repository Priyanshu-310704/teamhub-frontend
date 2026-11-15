import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Kanban,
  List as ListIcon,
  Plus,
  Settings,
  Trash2,
  Search,
  Sparkles,
  Filter,
  X,
  Loader2,
} from 'lucide-react';
import { projectApi } from '@/api/project.api';
import { taskApi } from '@/api/task.api';
import { teamApi } from '@/api/team.api';
import { aiApi } from '@/api/ai.api';
import { getErrorMessage } from '@/api/axios';
import { Task, TaskPriority, TaskStatus } from '@/types/task.types';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TaskKanbanView } from '@/components/tasks/TaskKanbanView';
import { TaskListView } from '@/components/tasks/TaskListView';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [initialTaskStatus, setInitialTaskStatus] = useState<TaskStatus>('TODO');
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');

  // AI Filter state
  const [aiFilterQuery, setAiFilterQuery] = useState('');
  const [isAiFiltering, setIsAiFiltering] = useState(false);
  const [aiFilteredTasks, setAiFilteredTasks] = useState<Task[] | null>(null);
  const [aiActiveExplanation, setAiActiveExplanation] = useState<string | null>(null);

  // 1. Fetch Project
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProjectById(projectId!),
    enabled: !!projectId,
  });

  // 2. Fetch Team Members for assignees
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', project?.teamId],
    queryFn: () => teamApi.getTeamMembers(project!.teamId),
    enabled: !!project?.teamId,
  });

  // 3. Fetch Tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => taskApi.getProjectTasks(projectId!),
    enabled: !!projectId,
  });

  // Task Status Update Mutation (used by Kanban drag-and-drop)
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({
      taskId,
      newStatus,
    }: {
      taskId: string;
      newStatus: TaskStatus;
    }) => taskApi.updateTask(taskId, { status: newStatus }),
    onMutate: async ({ taskId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['project-tasks', projectId] });
      const previousTasks = queryClient.getQueryData<Task[]>([
        'project-tasks',
        projectId,
      ]);

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['project-tasks', projectId],
          previousTasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        );
      }

      return { previousTasks };
    },
    onError: (err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ['project-tasks', projectId],
          context.previousTasks
        );
      }
      toast.error('Failed to update task status', {
        description: getErrorMessage(err),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Delete Project Mutation
  const deleteProjectMutation = useMutation({
    mutationFn: () => projectApi.deleteProject(projectId!),
    onSuccess: () => {
      toast.success('Project deleted');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
    },
    onError: (err) => {
      toast.error('Failed to delete project', {
        description: getErrorMessage(err),
      });
    },
  });

  // Handle Natural Language AI Board Filter
  const handleAiFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiFilterQuery.trim() || !projectId) return;

    setIsAiFiltering(true);
    try {
      const res = await aiApi.filterBoardByNaturalLanguage(projectId, {
        query: aiFilterQuery.trim(),
      });
      setAiFilteredTasks(res.tasks);
      const f = res.extractedFilter;
      const parts = [];
      if (f.status) parts.push(`status: ${f.status}`);
      if (f.priority) parts.push(`priority: ${f.priority}`);
      if (f.searchKeyword) parts.push(`keyword: "${f.searchKeyword}"`);
      setAiActiveExplanation(
        parts.length > 0 ? parts.join(', ') : 'Custom query match'
      );
      toast.success(`Found ${res.tasks.length} matching tasks via Spring AI`);
    } catch (err) {
      toast.error('AI Board Filter failed', {
        description: getErrorMessage(err),
      });
    } finally {
      setIsAiFiltering(false);
    }
  };

  const clearAiFilter = () => {
    setAiFilteredTasks(null);
    setAiActiveExplanation(null);
    setAiFilterQuery('');
  };

  const handleOpenAddTask = (status: TaskStatus = 'TODO') => {
    setInitialTaskStatus(status);
    setCreateTaskOpen(true);
  };

  // Compute tasks to show (AI filtered or standard client-filtered)
  const baseTasks = aiFilteredTasks !== null ? aiFilteredTasks : tasks;

  const displayedTasks = baseTasks.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(q) ||
      t.taskKey.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' || t.status === (statusFilter as TaskStatus);

    const matchesPriority =
      priorityFilter === 'ALL' || t.priority === (priorityFilter as TaskPriority);

    const matchesAssignee =
      assigneeFilter === 'ALL'
        ? true
        : assigneeFilter === 'UNASSIGNED'
        ? !t.assignee
        : t.assignee?.id === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  if (isLoadingProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Project not found</h2>
        <p className="text-sm text-muted-foreground">
          You may not have access to this project, or it was deleted.
        </p>
        <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <PageHeader
        title={project.name}
        description={project.description || 'Sprint & project backlog board.'}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {project.projectKey}
          </span>
          <StatusBadge status={project.status} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditProjectOpen(true)}
            className="gap-1.5 ml-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteConfirmOpen(true)}
            className="gap-1.5"
            title="Delete project"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenAddTask('TODO')}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </PageHeader>

      {/* Spring AI Natural Language Search Bar */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-transparent p-3 sm:p-4">
        <form onSubmit={handleAiFilter} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs shrink-0">
            <Sparkles className="h-4 w-4" />
            <span>AI Board Search:</span>
          </div>

          <div className="relative flex-1 w-full">
            <Input
              placeholder='e.g., "Find all urgent tasks", "show in progress review tasks", "unassigned todo"'
              value={aiFilterQuery}
              onChange={(e) => setAiFilterQuery(e.target.value)}
              className="h-9 text-xs bg-card/80 border-indigo-500/30"
              disabled={isAiFiltering}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="submit"
              size="sm"
              disabled={!aiFilterQuery.trim() || isAiFiltering}
              className="gap-1.5 h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
            >
              {isAiFiltering ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Filter with AI
            </Button>

            {aiFilteredTasks !== null && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAiFilter}
                className="gap-1 h-9 text-xs"
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </form>

        {aiActiveExplanation && (
          <div className="mt-2 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
            <span className="font-semibold">AI Filter Active:</span>
            <span>{aiActiveExplanation}</span>
          </div>
        )}
      </div>

      {/* Controls & Standard Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Status Filter */}
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

          {/* Priority Filter */}
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

          {/* Assignee Filter */}
          {teamMembers.length > 0 && (
            <div className="w-36">
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Assignees</SelectItem>
                  <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.name}
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

      {/* Main Board / List View */}
      {isLoadingTasks ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        <TaskKanbanView
          tasks={displayedTasks}
          onTaskClick={(task) => setSelectedTaskId(task.id)}
          onStatusChange={(taskId, newStatus) =>
            updateTaskStatusMutation.mutate({ taskId, newStatus })
          }
          onAddTaskInStatus={(st) => handleOpenAddTask(st)}
        />
      ) : (
        <TaskListView
          tasks={displayedTasks}
          onTaskClick={(task) => setSelectedTaskId(task.id)}
          onAddTask={() => handleOpenAddTask('TODO')}
        />
      )}

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        teamMembers={teamMembers}
        open={!!selectedTaskId}
        onOpenChange={(op) => !op && setSelectedTaskId(null)}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        projectId={project.id}
        teamMembers={teamMembers}
        defaultStatus={initialTaskStatus}
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        project={project}
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
      />

      {/* Confirm Project Deletion */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}" (${project.projectKey})? All tasks, comments, and milestones will be permanently removed.`}
        confirmLabel="Delete Project"
        isLoading={deleteProjectMutation.isPending}
        onConfirm={() => deleteProjectMutation.mutate()}
      />
    </div>
  );
};
