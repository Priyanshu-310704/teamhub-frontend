import React from 'react';
import {
  User,
  Shield,
  Palette,
  Server,
  LogOut,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/common/UserAvatar';
import { formatDate, formatDateTime } from '@/lib/utils';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
      <PageHeader
        title="Settings & Profile"
        description="Manage your account preferences, theme, and view backend system status."
      />

      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500" />
            <CardTitle>User Profile</CardTitle>
          </div>
          <CardDescription>
            Account details retrieved from the authenticated session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <UserAvatar
              name={user?.name}
              avatarUrl={user?.avatarUrl}
              size="xl"
            />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Member since {formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-muted/30 p-4 text-xs">
            <div>
              <span className="text-muted-foreground">User ID (UUID):</span>
              <p className="font-mono text-foreground mt-0.5 truncate select-all">
                {user?.id}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Authentication Token:</span>
              <p className="font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                Active (24-hour Spring Security JWT)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3.5 text-xs text-indigo-800 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-300">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Backend Note:</strong> The current Spring Boot service provides a read-only endpoint (<code>GET /api/users/me</code>). Profile updates, avatar uploads, and password change endpoints are not yet exposed by the backend and are intentionally not mocked on the frontend.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Preference Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-indigo-500" />
            <CardTitle>Appearance & Theme</CardTitle>
          </div>
          <CardDescription>
            Customize how TeamHub looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30'
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-300 mb-2 shadow-inner" />
              <span>Light</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30'
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              <div className="h-6 w-6 rounded-full bg-slate-900 border border-slate-700 mb-2 shadow-inner" />
              <span>Dark</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-semibold transition-all ${
                theme === 'system'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30'
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-slate-200 to-slate-800 border border-slate-400 mb-2" />
              <span>System</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Backend & Security Diagnostics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-indigo-500" />
            <CardTitle>Backend Integration Status</CardTitle>
          </div>
          <CardDescription>
            Technical details regarding the connected Spring Boot service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border p-3 space-y-1">
              <span className="text-muted-foreground">API Base URL:</span>
              <p className="font-mono font-semibold text-foreground truncate">
                {apiBaseUrl}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-1">
              <span className="text-muted-foreground">Spring AI Model:</span>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Gemini 3.8 Flash (Active)
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Implemented API Modules:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Authentication & JWT Validation</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Teams & Membership Roles (RBAC)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Projects CRUD & Key Enforcements</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Tasks Kanban & Position Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Comments & Discussion Threading</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Spring AI Task Drafts & Summaries</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout Action */}
      <div className="pt-2">
        <Button
          variant="destructive"
          onClick={logout}
          className="gap-2 shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out of TeamHub</span>
        </Button>
      </div>
    </div>
  );
};
