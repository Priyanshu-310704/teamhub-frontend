import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  customLabel?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customLabel }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="hidden items-center space-x-1.5 text-xs font-medium text-muted-foreground sm:flex">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>

      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        let display = segment.charAt(0).toUpperCase() + segment.slice(1);
        if (segment === 'dashboard') display = 'Overview';
        if (segment === 'teams') display = 'Teams';
        if (segment === 'projects') display = 'Projects';
        if (segment === 'tasks') display = 'My Tasks';
        if (segment === 'settings') display = 'Settings';

        // If it's a UUID and customLabel is provided for the last segment
        if (isLast && customLabel) {
          display = customLabel;
        } else if (segment.length > 20) {
          display = 'Details';
        }

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-foreground truncate max-w-[180px]">
                {display}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-foreground transition-colors truncate max-w-[140px]"
              >
                {display}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
