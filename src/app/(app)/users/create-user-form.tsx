

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader, Phone } from 'lucide-react';
import { userCreateSchema } from './schema';
import { createUserAction } from './actions';
import { useAuth } from '@/contexts/auth-context';

type CreateUserFormValues = z.infer<typeof userCreateSchema>;

export function CreateUserForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const { user: creator } = useAuth();
  const [isPending, startTransition] = React.useTransition();
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const onSubmit = (values: CreateUserFormValues) => {
    if (!creator) {
        toast({ title: 'Error', description: 'You must be logged in to create a user.', variant: 'destructive' });
        return;
    }
    startTransition(async () => {
      const result = await createUserAction(values, creator.id);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
        setOpen(false);
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="tel" placeholder="+1 555-123-4567" {...field} className="pl-9" />
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} {...field} />
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
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Agent">Agent</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={isPending}>
                Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Create User
            </Button>
        </div>
      </form>
    </Form>
  );
}
