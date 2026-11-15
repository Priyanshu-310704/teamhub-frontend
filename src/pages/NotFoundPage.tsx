import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="rounded-full bg-indigo-50 p-6 dark:bg-indigo-950/50 mb-6">
        <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
          404
        </span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-2">
        Page Not Found
      </h1>
      <p className="max-w-md text-sm text-muted-foreground mb-8">
        The workspace route or resource you are trying to access does not exist or has been relocated.
      </p>
      <div className="flex items-center gap-3">
        <Button asChild variant="outline">
          <Link to="/dashboard" className="gap-2">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};
