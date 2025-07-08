'use client';

import React from "react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader } from "lucide-react";
import type { User } from "@/lib/data";
import { updateUserSchema } from "@/app/(app)/users/schema";
import { useToast } from "@/hooks/use-toast";
import { updateUserAction } from "@/app/(app)/users/actions";

export function EditProfileForm({ user, setOpen }: { user: User; setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const onSubmit = (values: z.infer<typeof updateUserSchema>) => {
    startTransition(async () => {
      const result = await updateUserAction(user.id, values);
      if (result.success) {
        toast({
          title: "Profile Updated",
          description: result.message,
        });
        setOpen(false);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="w-full">
                  <Label htmlFor="avatar-file" className="text-sm font-medium">Profile Photo</Label>
                  <Input id="avatar-file" type="file" className="mt-1" disabled />
                  <p className="text-xs text-muted-foreground pt-1">
                      Avatar updates are not yet supported.
                  </p>
              </div>
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
             <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
