import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderGit2, Plus, Search, Filter } from 'lucide-react';
import { teamApi } from '@/api/team.api';
import { projectApi } from '@/api/project.api';
import { taskApi } from '@/api/task.api';
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
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectStatus } from '@/types/project.types';

export const ProjectsPage: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');

  // 1. Fetch user's teams
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamApi.getMyTeams(),
  });

  // 2. Fetch projects for each team
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

  // 3. Fetch all tasks to compute progress
  const { data: allTasks = [] } = useQuery({
    queryKey: ['all-tasks', allProjects.map((p) => p.id)],
    queryFn: async () => {
      if (allProjects.length === 0) return [];
      const taskPromises = allProjects.map((p) => taskApi.getProjectTasks(p.id));
      const results = await Promise.all(taskPromises);
      return results.flat();
    },
    enabled: allProjects.length > 0,
  });

  const isLoading = isLoadingTeams || isLoadingProjects;

  const filteredProjects = allProjects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.projectKey.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' || p.status === (statusFilter as ProjectStatus);

    const matchesTeam = teamFilter === 'ALL' || p.teamId === teamFilter;

    return matchesSearch && matchesStatus && matchesTeam;
  });

  const getTeamName = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name;
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="Projects"
        description="Manage your software development initiatives, Kanban boards, and deliverables."
      >
        <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Create Project</span>
        </Button>
      </PageHeader>

      {/* Filter and Search controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-40">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PLANNED">Planned</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {teams.length > 0 && (
          <div className="w-44">
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Teams</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title={
            search || statusFilter !== 'ALL' || teamFilter !== 'ALL'
              ? 'No projects match your filter'
              : 'No projects created yet'
          }
          description={
            search || statusFilter !== 'ALL' || teamFilter !== 'ALL'
              ? 'Try adjusting your search query or filters.'
              : 'Create your first project under a team to start organizing tasks.'
          }
          actionLabel={
            search || statusFilter !== 'ALL' || teamFilter !== 'ALL'
              ? undefined
              : 'Create Project'
          }
          onAction={() => setCreateOpen(true)}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const projectTasks = allTasks.filter((t) => t.projectId === project.id);
            const completedCount = projectTasks.filter((t) => t.status === 'DONE').length;

            return (
              <ProjectCard
                key={project.id}
                project={project}
                teamName={getTeamName(project.teamId)}
                totalTasks={projectTasks.length}
                completedTasks={completedCount}
              />
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        teams={teams}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
};
