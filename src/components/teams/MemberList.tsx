import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, UserPlus, Users } from 'lucide-react';
import { TeamMember, TeamRole } from '@/types/team.types';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/RoleBadge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import { teamApi } from '@/api/team.api';
import { getErrorMessage } from '@/api/axios';
import { EmptyState } from '@/components/common/EmptyState';

interface MemberListProps {
  teamId: string;
  members: TeamMember[];
  myRole: TeamRole;
  currentUserId?: string;
  onOpenAddModal: () => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  teamId,
  members,
  myRole,
  currentUserId,
  onOpenAddModal,
}) => {
  const queryClient = useQueryClient();
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  const canManageMembers = myRole === 'OWNER' || myRole === 'ADMIN';

  const removeMutation = useMutation({
    mutationFn: (userId: string) => teamApi.removeMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      toast.success('Member removed', {
        description: `${memberToRemove?.name} has been removed from this team.`,
      });
      setMemberToRemove(null);
    },
    onError: (error) => {
      toast.error('Failed to remove member', {
        description: getErrorMessage(error),
      });
    },
  });

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members yet"
        description="Add teammates to collaborate on projects together."
        actionLabel={canManageMembers ? 'Add Member' : undefined}
        onAction={canManageMembers ? onOpenAddModal : undefined}
        actionIcon={UserPlus}
      />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/80 p-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Team Members ({members.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Users with access to this team and its associated projects.
          </p>
        </div>
        {canManageMembers && (
          <Button size="sm" onClick={onOpenAddModal} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      <div className="divide-y divide-border/60">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const isOwner = member.role === 'OWNER';
          const canRemove = canManageMembers && !isOwner && !isCurrentUser;

          return (
            <div
              key={member.membershipId}
              className="flex items-center justify-between p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={member.name}
                  avatarUrl={member.avatarUrl}
                  size="md"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {member.name}
                    </span>
                    {isCurrentUser && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {member.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground">
                  <span>Joined</span>
                  <span className="font-medium text-foreground">
                    {formatDate(member.joinedAt)}
                  </span>
                </div>

                <RoleBadge role={member.role} />

                {canRemove ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMemberToRemove(member)}
                    className="text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    title={`Remove ${member.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="w-9" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title="Remove Member from Team"
        description={`Are you sure you want to remove ${memberToRemove?.name} (${memberToRemove?.email}) from this team? They will lose access to all team projects.`}
        confirmLabel="Remove Member"
        isLoading={removeMutation.isPending}
        onConfirm={() => {
          if (memberToRemove) {
            removeMutation.mutate(memberToRemove.userId);
          }
        }}
      />
    </div>
  );
};
