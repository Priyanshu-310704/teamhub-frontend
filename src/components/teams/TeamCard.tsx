import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleBadge } from '@/components/common/RoleBadge';
import { Team } from '@/types/team.types';
import { formatDate } from '@/lib/utils';

interface TeamCardProps {
  team: Team;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  return (
    <Card className="flex flex-col justify-between hover:shadow-card-hover hover:border-indigo-500/30 transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {team.name}
              </CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <Calendar className="h-3 w-3" />
                <span>Created {formatDate(team.createdAt)}</span>
              </div>
            </div>
          </div>
          <RoleBadge role={team.myRole} />
        </div>
      </CardHeader>

      <CardContent className="py-2 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {team.description || 'No description provided for this team.'}
        </p>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Team Workspace</span>
        <Link
          to={`/teams/${team.id}`}
          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Team</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
};
