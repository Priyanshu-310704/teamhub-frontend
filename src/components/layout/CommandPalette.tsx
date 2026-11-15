import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Search,
  LayoutDashboard,
  Users,
  FolderGit2,
  CheckSquare,
  Settings,
  PlusCircle,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCreateTask?: () => void;
  onOpenCreateProject?: () => void;
  onOpenCreateTeam?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onOpenCreateTask,
  onOpenCreateProject,
  onOpenCreateTeam,
}) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const items = [
    {
      category: 'Navigation',
      items: [
        {
          label: 'Overview Dashboard',
          icon: LayoutDashboard,
          action: () => navigate('/dashboard'),
        },
        {
          label: 'Teams Directory',
          icon: Users,
          action: () => navigate('/teams'),
        },
        {
          label: 'Projects',
          icon: FolderGit2,
          action: () => navigate('/projects'),
        },
        {
          label: 'My Assigned Tasks',
          icon: CheckSquare,
          action: () => navigate('/tasks'),
        },
        {
          label: 'Account & Settings',
          icon: Settings,
          action: () => navigate('/settings'),
        },
      ],
    },
    {
      category: 'Quick Actions',
      items: [
        {
          label: 'Create New Team',
          icon: PlusCircle,
          action: () => {
            if (onOpenCreateTeam) onOpenCreateTeam();
            else navigate('/teams');
          },
        },
        {
          label: 'Create New Project',
          icon: PlusCircle,
          action: () => {
            if (onOpenCreateProject) onOpenCreateProject();
            else navigate('/projects');
          },
        },
        {
          label: 'Create New Task',
          icon: PlusCircle,
          action: () => {
            if (onOpenCreateTask) onOpenCreateTask();
            else navigate('/tasks');
          },
        },
      ],
    },
  ];

  const filtered = items
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  const handleSelect = (action: () => void) => {
    action();
    onOpenChange(false);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-border bg-card shadow-2xl">
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}".
            </p>
          ) : (
            filtered.map((group) => (
              <div key={group.category} className="mb-2">
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.category}
                </div>
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSelect(item.action)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                  >
                    <item.icon className="h-4 w-4 text-indigo-500" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
          <span>Navigate with arrows or click</span>
          <div className="flex items-center gap-1.5">
            <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-sm">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
