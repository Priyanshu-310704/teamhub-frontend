import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, CheckCircle2, AlertOctagon, ArrowRight, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { aiApi } from '@/api/ai.api';
import { getErrorMessage } from '@/api/axios';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AiTaskSummaryModalProps {
  taskId: string;
  taskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AiTaskSummaryModal: React.FC<AiTaskSummaryModalProps> = ({
  taskId,
  taskTitle,
  open,
  onOpenChange,
}) => {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['task-ai-summary', taskId],
    queryFn: () => aiApi.summarizeTaskDiscussion(taskId),
    enabled: open,
    staleTime: 60000,
  });

  const copySummary = () => {
    if (!summary) return;
    const text = `TL;DR: ${summary.tldr}\n\nKey Decisions:\n${(summary.keyDecisions || []).map((d) => `- ${d}`).join('\n')}\n\nOpen Blockers:\n${(summary.openBlockers || []).map((b) => `- ${b}`).join('\n')}\n\nNext Steps:\n${(summary.nextSteps || []).map((s) => `- ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    toast.success('Summary copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
              <DialogTitle>AI Discussion Summary</DialogTitle>
            </div>
            {summary && (
              <Button
                variant="outline"
                size="sm"
                onClick={copySummary}
                className="gap-1.5 h-8 text-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            )}
          </div>
          <DialogDescription className="truncate">
            Synthesis of comments & updates for "{taskTitle}".
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" label="Analyzing discussion threads with Gemini Flash..." />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {getErrorMessage(error)}
          </div>
        ) : summary ? (
          <div className="space-y-4 pt-2">
            {/* TLDR */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/50 p-4 dark:bg-indigo-950/30">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1">
                Executive TL;DR
              </h4>
              <p className="text-sm text-foreground leading-relaxed">
                {summary.tldr || 'No overall summary could be derived.'}
              </p>
            </div>

            {/* Key Decisions */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Key Decisions Made</span>
              </div>
              {summary.keyDecisions && summary.keyDecisions.length > 0 ? (
                <ul className="list-disc pl-5 text-xs text-foreground/85 space-y-1">
                  {summary.keyDecisions.map((decision, idx) => (
                    <li key={idx}>{decision}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No explicit decisions noted yet.
                </p>
              )}
            </div>

            {/* Open Blockers */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <AlertOctagon className="h-4 w-4" />
                <span>Open Blockers & Risks</span>
              </div>
              {summary.openBlockers && summary.openBlockers.length > 0 ? (
                <ul className="list-disc pl-5 text-xs text-foreground/85 space-y-1">
                  {summary.openBlockers.map((blocker, idx) => (
                    <li key={idx}>{blocker}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No unresolved blockers identified!
                </p>
              )}
            </div>

            {/* Next Steps */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <ArrowRight className="h-4 w-4" />
                <span>Action Items & Next Steps</span>
              </div>
              {summary.nextSteps && summary.nextSteps.length > 0 ? (
                <ul className="list-disc pl-5 text-xs text-foreground/85 space-y-1">
                  {summary.nextSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No next steps identified.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
