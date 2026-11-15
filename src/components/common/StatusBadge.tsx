import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/types/task.types';
import { ProjectStatus } from '@/types/project.types';
import { Circle, Clock, CheckCircle2, AlertCircle, Archive, PlayCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus | ProjectStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    // Task Statuses
    case 'TODO':
      return (
        <Badge variant="secondary" className={className}>
          <Circle className="h-2.5 w-2.5 fill-slate-400 text-slate-400" />
          To Do
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="default" className={className}>
          <Clock className="h-2.5 w-2.5 animate-spin" />
          In Progress
        </Badge>
      );
    case 'IN_REVIEW':
      return (
        <Badge variant="purple" className={className}>
          <AlertCircle className="h-2.5 w-2.5" />
          In Review
        </Badge>
      );
    case 'DONE':
      return (
        <Badge variant="success" className={className}>
          <CheckCircle2 className="h-2.5 w-2.5" />
          Done
        </Badge>
      );

    // Project Statuses
    case 'PLANNED':
      return (
        <Badge variant="secondary" className={className}>
          <Circle className="h-2.5 w-2.5" />
          Planned
        </Badge>
      );
    case 'ACTIVE':
      return (
        <Badge variant="success" className={className}>
          <PlayCircle className="h-2.5 w-2.5" />
          Active
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="default" className={className}>
          <CheckCircle2 className="h-2.5 w-2.5" />
          Completed
        </Badge>
      );
    case 'ARCHIVED':
      return (
        <Badge variant="outline" className={className}>
          <Archive className="h-2.5 w-2.5" />
          Archived
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
