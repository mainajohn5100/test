
'use client';

import React from "react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { KeyRound, Loader } from "lucide-react";
import type { User } from "@/lib/data";
import { updateUserSchema } from "@/app/(app)/users/schema";
import { useToast } from "@/hooks/use-toast";
import { updateUserAction } from "@/app/(app)/users/actions";
import { useAuth } from "@/contexts/auth-context";
import { ChangePasswordForm } from "./change-password-form";

export function EditProfileForm({ user, setOpen }: { user: User; setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [isPending, startTransition] = React.useTransition();
  const [isPasswordDialogOpen, setPasswordDialogOpen] = React.useState(false);

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(user.avatar);

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = (values: z.infer<typeof updateUserSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name || '');
      formData.append('email', values.email || '');
      formData.append('currentEmail', user.email);

      if (selectedFile) {
          formData.append('avatar', selectedFile);
      }
      
      const result = await updateUserAction(user.id, formData);
      if (result.success) {
        toast({
          title: "Profile Updated",
          description: result.message,
          duration: 8000
        });
        await refreshUser();
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
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                  <AvatarImage src={previewUrl || undefined} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="w-full">
                  <FormLabel>Profile Photo</FormLabel>
                  <Input 
                    id="avatar-file" 
                    type="file" 
                    className="mt-1" 
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground pt-1">
                      Upload a new profile picture.
                  </p>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                      <p className="text-xs text-muted-foreground pt-1">
                      Changing email requires re-authentication and verification. This feature is not fully implemented on server actions.
                      </p>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
          <Dialog open={isPasswordDialogOpen} onOpenChange={setPasswordDialogOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                    <KeyRound className="mr-2"/>
                    Change Password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <ChangePasswordForm setOpen={setPasswordDialogOpen} />
            </DialogContent>
          </Dialog>
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
