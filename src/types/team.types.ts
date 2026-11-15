export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  myRole: TeamRole;
  createdAt: string;
}

export interface TeamMember {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: TeamRole;
  joinedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface AddTeamMemberRequest {
  email: string;
  role: 'ADMIN' | 'MEMBER';
}
