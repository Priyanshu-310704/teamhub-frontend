import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TeamRole } from '@/types/team.types';
import { Crown, Shield, User } from 'lucide-react';

interface RoleBadgeProps {
  role: TeamRole;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  switch (role) {
    case 'OWNER':
      return (
        <Badge variant="purple" className={className}>
          <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />
          Owner
        </Badge>
      );
    case 'ADMIN':
      return (
        <Badge variant="default" className={className}>
          <Shield className="h-3 w-3 text-indigo-500" />
          Admin
        </Badge>
      );
    case 'MEMBER':
      return (
        <Badge variant="secondary" className={className}>
          <User className="h-3 w-3 text-slate-500" />
          Member
        </Badge>
      );
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};
