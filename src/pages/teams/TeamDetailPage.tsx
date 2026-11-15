import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  FolderGit2,
  Calendar,
  UserPlus,
  PlusCircle,
  Shield,
  Crown,
  Info,
} from 'lucide-react';
import { teamApi } from '@/api/team.api';
import { projectApi } from '@/api/project.api';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/common/RoleBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MemberList } from '@/components/teams/MemberList';
import { AddMemberModal } from '@/components/teams/AddMemberModal';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

export const TeamDetailPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  // 1. Fetch team details
  const { data: team, isLoading: isLoadingTeam, error: teamError } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamApi.getTeamById(teamId!),
    enabled: !!teamId,
  });

  // 2. Fetch team members
  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => teamApi.getTeamMembers(teamId!),
    enabled: !!teamId,
  });

  // 3. Fetch team projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['team-projects', teamId],
    queryFn: () => projectApi.getTeamProjects(teamId!),
    enabled: !!teamId,
  });

  const canManage = team?.myRole === 'OWNER' || team?.myRole === 'ADMIN';

  if (isLoadingTeam) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (teamError || !team) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Team not found</h2>
        <p className="text-sm text-muted-foreground">
          You may not be a member of this team, or it does not exist.
        </p>
        <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <PageHeader
        title={team.name}
        description={team.description || 'No description provided.'}
      >
        <div className="flex items-center gap-3">
          <RoleBadge role={team.myRole} />

          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddMemberOpen(true)}
                className="gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite Member</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setCreateProjectOpen(true)}
                className="gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                <span>New Project</span>
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      {/* Team Meta Bar */}
      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-500" />
          <span className="font-semibold text-foreground">{members.length}</span>
          <span>members</span>
        </div>
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-violet-500" />
          <span className="font-semibold text-foreground">{projects.length}</span>
          <span>projects</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>Formed on {formatDate(team.createdAt)}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="permissions">Roles & Access</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="mt-6 space-y-4">
          {isLoadingProjects ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderGit2}
              title="No projects in this team"
              description="Create a project to start planning sprints and tracking tasks."
              actionLabel={canManage ? 'Create Project' : undefined}
              onAction={() => setCreateProjectOpen(true)}
              actionIcon={PlusCircle}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  teamName={team.name}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-6">
          {isLoadingMembers ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <MemberList
              teamId={team.id}
              members={members}
              myRole={team.myRole}
              currentUserId={user?.id}
              onOpenAddModal={() => setAddMemberOpen(true)}
            />
          )}
        </TabsContent>

        {/* Roles & Access Info Tab */}
        <TabsContent value="permissions" className="mt-6 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              <span>Team Membership Roles & Permissions</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              TeamHub implements role-based access control (RBAC) enforced strictly by the Spring Boot security service.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-2">
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/50 dark:bg-purple-950/20">
                <div className="flex items-center gap-2 font-semibold text-purple-700 dark:text-purple-300 text-sm mb-2">
                  <Crown className="h-4 w-4" />
                  <span>OWNER</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The team creator. Has full administrative privileges: creates and deletes projects, invites members, removes members, and cannot be removed.
                </p>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                <div className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300 text-sm mb-2">
                  <Shield className="h-4 w-4" />
                  <span>ADMIN</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Management authority: Can add new members, remove non-owner members, and create or configure projects.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 text-sm mb-2">
                  <Users className="h-4 w-4" />
                  <span>MEMBER</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Standard team member: Can view team projects, create tasks, move Kanban cards, and collaborate on task discussions.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddMemberModal
        teamId={team.id}
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
      />

      <CreateProjectModal
        teams={[team]}
        defaultTeamId={team.id}
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
    </div>
  );
};
