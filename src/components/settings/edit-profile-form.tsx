
'use client';

import React from "react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader } from "lucide-react";
import type { User } from "@/lib/data";
import { updateUserSchema } from "@/app/(app)/users/schema";
import { useToast } from "@/hooks/use-toast";
import { updateUserAction } from "@/app/(app)/users/actions";

export function EditProfileForm({ user, setOpen }: { user: User; setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      country: user.country || '',
      city: user.city || '',
      zipCode: user.zipCode || '',
      dob: user.dob ? new Date(user.dob) : undefined,
      gender: user.gender || '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = (values: z.infer<typeof updateUserSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      // Append all form values to formData
      if (values.name) formData.append('name', values.name);
      if (values.email) formData.append('email', values.email);
      if (values.phone) formData.append('phone', values.phone);
      if (values.country) formData.append('country', values.country);
      if (values.city) formData.append('city', values.city);
      if (values.zipCode) formData.append('zipCode', values.zipCode);
      if (values.dob) formData.append('dob', values.dob.toISOString());
      if (values.gender) formData.append('gender', values.gender);
      
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      const result = await updateUserAction(user.id, formData);
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                  <AvatarImage src={previewUrl || user.avatar} alt={user.name} />
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
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Zip/Postal Code</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Date of birth</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
