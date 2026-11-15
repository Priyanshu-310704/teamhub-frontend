import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  CheckSquare,
  Settings,
  LogOut,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const navItems = [
  {
    name: 'Overview',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Teams',
    path: '/teams',
    icon: Users,
  },
  {
    name: 'Projects',
    path: '/projects',
    icon: FolderGit2,
  },
  {
    name: 'My Tasks',
    path: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0c1527] text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800/80',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/25 text-white">
              <Layers className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white">
                    TeamHub
                  </span>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-400 border border-indigo-500/30">
                    SaaS
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate">
                  Collaboration Hub
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/80 hover:text-white transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className={cn('px-2 mb-2', collapsed && 'text-center')}>
            {!collapsed ? (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Workspace
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">•••</span>
            )}
          </div>

          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            const NavContent = (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
                  collapsed && 'justify-center px-0'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform group-hover:scale-105',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  )}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{NavContent}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-900 text-white border-slate-800">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return NavContent;
          })}

          {/* AI Features Callout (if expanded) */}
          {!collapsed && (
            <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Spring AI Enabled</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Generate task drafts, summarize discussions, and filter boards with AI.
              </p>
            </div>
          )}
        </div>

        {/* User Profile & Logout Footer */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-950/40">
          <div
            className={cn(
              'flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-800/50',
              collapsed && 'justify-center p-1'
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <UserAvatar
                name={user?.name}
                avatarUrl={user?.avatarUrl}
                size={collapsed ? 'sm' : 'md'}
              />
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-white truncate">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {user?.email || ''}
                  </span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={logout}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};
