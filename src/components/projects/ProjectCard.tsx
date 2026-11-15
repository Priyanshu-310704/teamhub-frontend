import React from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Project } from '@/types/project.types';
import { formatDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  teamName?: string;
  totalTasks?: number;
  completedTasks?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  teamName,
  totalTasks = 0,
  completedTasks = 0,
}) => {
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Card className="flex flex-col justify-between hover:shadow-card-hover hover:border-indigo-500/30 transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 group-hover:scale-105 transition-transform">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </CardTitle>
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground uppercase">
                  {project.projectKey}
                </span>
              </div>
              {teamName && (
                <span className="text-xs text-muted-foreground">{teamName}</span>
              )}
            </div>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </CardHeader>

      <CardContent className="py-2 flex-1 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description || 'No description provided.'}
        </p>

        {/* Task Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              <span>
                {completedTasks}/{totalTasks} tasks done
              </span>
            </span>
            <span className="font-semibold text-foreground">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Updated {formatDate(project.updatedAt)}</span>
        </div>
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Open Board</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
};
