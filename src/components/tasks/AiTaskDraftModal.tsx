import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Loader2, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { aiApi } from '@/api/ai.api';
import { getErrorMessage } from '@/api/axios';
import { AiTaskDraftResponse } from '@/types/ai.types';
import { TaskPriority } from '@/types/task.types';

interface AiTaskDraftModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyDraft: (draft: {
    title: string;
    description: string;
    priority: TaskPriority;
  }) => void;
}

export const AiTaskDraftModal: React.FC<AiTaskDraftModalProps> = ({
  projectId,
  open,
  onOpenChange,
  onApplyDraft,
}) => {
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft] = useState<AiTaskDraftResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (userPrompt: string) =>
      aiApi.generateTaskDraft(projectId, { prompt: userPrompt }),
    onSuccess: (data) => {
      setDraft(data);
      toast.success('AI Draft Generated!', {
        description: 'Review the suggested title and criteria below.',
      });
    },
    onError: (error) => {
      toast.error('AI Draft Generation Failed', {
        description: getErrorMessage(error),
      });
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    mutation.mutate(prompt.trim());
  };

  const handleApply = () => {
    if (!draft) return;
    let fullDescription = draft.description || '';
    if (draft.acceptanceCriteria && draft.acceptanceCriteria.length > 0) {
      fullDescription +=
        '\n\n### Acceptance Criteria:\n' +
        draft.acceptanceCriteria.map((c) => `- ${c}`).join('\n');
    }

    onApplyDraft({
      title: draft.suggestedTitle,
      description: fullDescription.trim(),
      priority: draft.suggestedPriority,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
            <DialogTitle>Spring AI Task Assistant</DialogTitle>
          </div>
          <DialogDescription>
            Describe what needs to be done, and Gemini Flash will draft a title, description, and acceptance criteria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ai-prompt">Task Requirements / Brief *</Label>
            <Textarea
              id="ai-prompt"
              placeholder="e.g., Implement PostgreSQL connection pooling using HikariCP with metrics logging and health checks..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={mutation.isPending}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={!prompt.trim() || mutation.isPending}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Draft
                </>
              )}
            </Button>
          </div>
        </form>

        {draft && (
          <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-50/40 p-4 dark:bg-indigo-950/20 space-y-3 animate-in fade-in-0 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                Suggested Title
              </span>
              <PriorityBadge priority={draft.suggestedPriority} />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {draft.suggestedTitle}
            </p>

            <div className="text-xs text-muted-foreground whitespace-pre-wrap">
              {draft.description}
            </div>

            {draft.acceptanceCriteria && draft.acceptanceCriteria.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-indigo-200 dark:border-indigo-900">
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                  Acceptance Criteria:
                </span>
                <ul className="list-disc pl-4 text-xs text-foreground/80 space-y-0.5">
                  {draft.acceptanceCriteria.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={handleApply}
              className="w-full gap-2 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
            >
              <Check className="h-3.5 w-3.5" />
              Apply to Task Form
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
