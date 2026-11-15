import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskPriority } from '@/types/task.types';
import { AlertTriangle, ArrowDown, ArrowUp, Flame } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className,
  showIcon = true,
}) => {
  switch (priority) {
    case 'LOW':
      return (
        <Badge variant="secondary" className={className}>
          {showIcon && <ArrowDown className="h-3 w-3 text-slate-500" />}
          Low
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="warning" className={className}>
          {showIcon && <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />}
          Medium
        </Badge>
      );
    case 'HIGH':
      return (
        <Badge variant="destructive" className={className}>
          {showIcon && <ArrowUp className="h-3 w-3 text-rose-600 dark:text-rose-400" />}
          High
        </Badge>
      );
    case 'URGENT':
      return (
        <Badge variant="destructive" className="bg-rose-600 text-white animate-pulse">
          {showIcon && <Flame className="h-3 w-3" />}
          Urgent
        </Badge>
      );
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};
