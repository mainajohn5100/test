
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogContent,
} from '@/components/ui/dialog';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { updatePassword } from 'firebase/auth';
import { ReauthenticationForm } from './reauthentication-form';

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ChangePasswordForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [reauthRequired, setReauthRequired] = React.useState(true);
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: PasswordFormValues) => {
    startTransition(async () => {
      const user = auth.currentUser;
      if (!user) {
        toast({ title: "Error", description: "Not authenticated.", variant: "destructive" });
        return;
      }
      
      try {
        await updatePassword(user, values.newPassword);
        toast({ title: "Success", description: "Password updated successfully." });
        setOpen(false);
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          setReauthRequired(true);
        } else {
          console.error("Error updating password:", error);
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      }
    });
  };

  if (reauthRequired) {
    return (
        <DialogContent>
            <ReauthenticationForm 
                onSuccess={() => setReauthRequired(false)}
                onCancel={() => setOpen(false)}
                description="For your security, please enter your current password to continue."
            />
        </DialogContent>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-6">
            <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input type={showNewPassword ? "text" : "password"} {...field} className="pr-10" />
                             <Button 
                                type="button" 
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                         <div className="relative">
                            <Input type={showConfirmPassword ? "text" : "password"} {...field} className="pr-10" />
                             <Button 
                                type="button" 
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isPending}>Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
