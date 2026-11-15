import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  FolderGit2,
  CheckSquare,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { teamApi } from '@/api/team.api';
import { projectApi } from '@/api/project.api';
import { taskApi } from '@/api/task.api';
import { Project } from '@/types/project.types';
import { Task } from '@/types/task.types';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { TasksDistributionChart } from '@/components/dashboard/TasksDistributionChart';
import { PriorityBreakdownChart } from '@/components/dashboard/PriorityBreakdownChart';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateTeamModal } from '@/components/teams/CreateTeamModal';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  // 1. Fetch user's teams
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamApi.getMyTeams(),
  });

  // 2. Fetch projects for each team
  const { data: allProjects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['all-dashboard-projects', teams.map((t) => t.id)],
    queryFn: async () => {
      if (teams.length === 0) return [];
      const projectPromises = teams.map((t) => projectApi.getTeamProjects(t.id));
      const results = await Promise.all(projectPromises);
      return results.flat();
    },
    enabled: teams.length > 0,
  });

  // 3. Fetch tasks for each project
  const { data: allTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['all-dashboard-tasks', allProjects.map((p) => p.id)],
    queryFn: async () => {
      if (allProjects.length === 0) return [];
      const taskPromises = allProjects.map((p) => taskApi.getProjectTasks(p.id));
      const results = await Promise.all(taskPromises);
      return results.flat();
    },
    enabled: allProjects.length > 0,
  });

  const isLoading = isLoadingTeams || isLoadingProjects || isLoadingTasks;

  // Derivations
  const totalTeams = teams.length;
  const totalProjects = allProjects.length;
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todoCount = allTasks.filter((t) => t.status === 'TODO').length;
  const inReviewCount = allTasks.filter((t) => t.status === 'IN_REVIEW').length;

  const lowCount = allTasks.filter((t) => t.priority === 'LOW').length;
  const mediumCount = allTasks.filter((t) => t.priority === 'MEDIUM').length;
  const highCount = allTasks.filter((t) => t.priority === 'HIGH').length;
  const urgentCount = allTasks.filter((t) => t.priority === 'URGENT').length;

  // Recent projects
  const recentProjects = [...allProjects]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    )
    .slice(0, 3);

  // Recent tasks
  const recentTasks = [...allTasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const getTeamNameForProject = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name;
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${user?.name || 'Developer'}`}
        description="Here is an overview of your teams, active projects, and sprint tasks."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCreateTeamOpen(true)}
          className="gap-1.5"
        >
          <Users className="h-4 w-4 text-indigo-500" />
          <span>New Team</span>
        </Button>

        <Button
          size="sm"
          onClick={() => {
            if (teams.length === 0) {
              setCreateTeamOpen(true);
            } else {
              setCreateProjectOpen(true);
            }
          }}
          className="gap-1.5"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </PageHeader>

      {/* Stats Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Teams"
            value={totalTeams}
            subtitle="Organizations you belong to"
            icon={Users}
            iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400"
          />
          <StatCard
            title="Active Projects"
            value={totalProjects}
            subtitle="Across all workspace teams"
            icon={FolderGit2}
            iconColor="text-violet-600 bg-violet-50 dark:bg-violet-950/60 dark:text-violet-400"
          />
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            subtitle={`${inProgressTasks} currently in progress`}
            icon={CheckSquare}
            iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400"
          />
          <StatCard
            title="Completed"
            value={`${completionRate}%`}
            subtitle={`${completedTasks} of ${totalTasks} tasks finished`}
            icon={CheckCircle2}
            iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400"
            trend={totalTasks > 0 ? `${completedTasks} closed` : undefined}
          />
        </div>
      )}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TasksDistributionChart
          todoCount={todoCount}
          inProgressCount={inProgressTasks}
          inReviewCount={inReviewCount}
          doneCount={completedTasks}
        />
        <PriorityBreakdownChart
          lowCount={lowCount}
          mediumCount={mediumCount}
          highCount={highCount}
          urgentCount={urgentCount}
        />
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Recent Projects
            </h2>
            <p className="text-xs text-muted-foreground">
              Projects with recent activity and updates.
            </p>
          </div>
          <Link
            to="/projects"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
          >
            <span>View all projects</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            No projects found. Create a team and project to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => {
              const projectTasks = allTasks.filter((t) => t.projectId === project.id);
              const doneTasks = projectTasks.filter((t) => t.status === 'DONE').length;

              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  teamName={getTeamNameForProject(project.teamId)}
                  totalTasks={projectTasks.length}
                  completedTasks={doneTasks}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Latest Tasks
            </h2>
            <p className="text-xs text-muted-foreground">
              Recently created action items across your projects.
            </p>
          </div>
          <Link
            to="/tasks"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
          >
            <span>View my tasks</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            No tasks created yet. Open any project to add your first task!
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card divide-y divide-border/60 shadow-sm overflow-hidden">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/projects/${task.projectId}`)}
                className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {task.taskKey}
                  </span>
                  <span className="text-sm font-medium text-foreground max-w-md truncate">
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTeamModal
        open={createTeamOpen}
        onOpenChange={setCreateTeamOpen}
        onSuccess={() => {
          if (teams.length === 0) setCreateProjectOpen(true);
        }}
      />

      <CreateProjectModal
        teams={teams}
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
    </div>
  );
};
