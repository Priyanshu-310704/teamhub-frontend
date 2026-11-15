import React from 'react';
import { cn, getAvatarColor, getInitials } from '@/lib/utils';

interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-16 w-16 text-xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className,
}) => {
  const [imageError, setImageError] = React.useState(false);

  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'Avatar'}
        onError={() => setImageError(true)}
        className={cn(
          'rounded-full object-cover ring-1 ring-border shadow-sm shrink-0',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white ring-1 ring-white/20 shadow-sm shrink-0 select-none',
        sizeClasses[size],
        colorClass,
        className
      )}
      title={name || undefined}
    >
      {initials}
    </div>
  );
};
