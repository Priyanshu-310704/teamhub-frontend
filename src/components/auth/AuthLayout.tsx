import React from 'react';
import { Layers, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Feature Showcase Banner (hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-[#0c1527] p-12 text-white lg:flex overflow-hidden">
        {/* Subtle background glow effects */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">TeamHub</span>
            <span className="ml-2 rounded bg-indigo-500/25 px-2 py-0.5 text-xs font-medium text-indigo-300 border border-indigo-500/30">
              SaaS
            </span>
          </div>
        </div>

        {/* Value Proposition Graphic */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-medium text-indigo-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Built for High-Velocity Engineering Teams</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Organize projects, sprint tasks, and collaborate without friction.
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Complete project management with Kanban boards, role-based team access control, task discussions, and Spring AI assistance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Kanban & Sprint Boards</span>
              </div>
              <p className="text-xs text-slate-400">
                Visual workflows with live status progression and priority badges.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
                <Zap className="h-4 w-4" />
                <span>Spring AI Intelligence</span>
              </div>
              <p className="text-xs text-slate-400">
                Instant task generation and discussion summaries powered by Gemini Flash.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Spring Security JWT Protected</span>
          </div>
          <span>&copy; {new Date().getFullYear()} TeamHub Inc.</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">TeamHub</span>
          </div>

          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
