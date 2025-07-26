
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import type { User } from '@/lib/data';
import { Logo } from '../icons';
import { Loader } from 'lucide-react';
import { completeOrgCreationAction } from '@/app/(auth)/signup/actions';

const orgSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters."),
});

export function CreateOrganizationFlow({ user }: { user: User }) {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      organizationName: '',
    },
  });

  const onSubmit = (values: z.infer<typeof orgSchema>) => {
    startTransition(async () => {
      const result = await completeOrgCreationAction(user.id, values.organizationName);
      if (result.success) {
        toast({
          title: "Organization Created!",
          description: "Welcome to RequestFlow. You are now being redirected.",
        });
        await refreshUser(); // This will re-fetch user, now with an orgId
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Logo className="w-8 h-8" />
                <h1 className="font-headline font-semibold text-2xl">RequestFlow</h1>
            </div>
            <CardTitle>One Last Step!</CardTitle>
            <CardDescription>Welcome, {user.name}. Please create an organization to continue.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Acme Inc." {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button className="w-full" type="submit" disabled={isPending}>
                        {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Create Organization & Continue
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
