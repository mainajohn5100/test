
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
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { reauthenticateAction } from '@/app/(app)/settings/actions';

const reauthSchema = z.object({
  password: z.string().min(1, 'Password is required.'),
});

type ReauthFormValues = z.infer<typeof reauthSchema>;

interface ReauthenticationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  description: string;
}

export function ReauthenticationForm({ onSuccess, onCancel, description }: ReauthenticationFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<ReauthFormValues>({
    resolver: zodResolver(reauthSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = (values: ReauthFormValues) => {
    setError(null);
    startTransition(async () => {
      const result = await reauthenticateAction(values.password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Re-authentication Required</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                      <Input type={showPassword ? "text" : "password"} {...field} className="pr-10" />
                      <Button 
                          type="button" 
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                      >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-sm font-medium text-destructive mt-2">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
                Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
