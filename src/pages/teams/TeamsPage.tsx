import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Plus, Search } from 'lucide-react';
import { teamApi } from '@/api/team.api';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TeamCard } from '@/components/teams/TeamCard';
import { CreateTeamModal } from '@/components/teams/CreateTeamModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

export const TeamsPage: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamApi.getMyTeams(),
  });

  const filteredTeams = teams.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="Teams Directory"
        description="Collaborate within functional units, manage memberships, and organize projects."
      >
        <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Create Team</span>
        </Button>
      </PageHeader>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No teams match your search' : 'No teams created yet'}
          description={
            search
              ? 'Try modifying your search criteria.'
              : 'Create your first team to start inviting members and managing projects.'
          }
          actionLabel={search ? undefined : 'Create Team'}
          onAction={() => setCreateOpen(true)}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <CreateTeamModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
};
