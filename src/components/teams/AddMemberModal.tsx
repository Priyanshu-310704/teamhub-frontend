import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { teamApi } from '@/api/team.api';
import { getErrorMessage } from '@/api/axios';

const addMemberSchema = z.object({
  email: z
    .string()
    .min(1, 'Member email is required')
    .email('Provide a valid email address'),
  role: z.enum(['ADMIN', 'MEMBER']),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

interface AddMemberModalProps {
  teamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  teamId,
  open,
  onOpenChange,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: AddMemberFormData) => teamApi.addMember(teamId, data),
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      toast.success('Member added successfully!', {
        description: `${member.name} (${member.email}) joined as ${member.role}.`,
      });
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to add member', {
        description: getErrorMessage(error),
      });
    },
  });

  const onSubmit = (data: AddMemberFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Invite a registered user to join this team using their registered email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="member-email">Registered Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="member-email"
                type="email"
                placeholder="colleague@company.com"
                className="pl-9"
                disabled={mutation.isPending}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-role">Team Role *</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger id="member-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member (Read & Contribute)</SelectItem>
                    <SelectItem value="ADMIN">Admin (Manage Projects & Members)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {errors.role.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
