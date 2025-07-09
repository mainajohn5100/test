
'use client';

import React, { useState, useTransition } from "react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader, Send } from "lucide-react";
import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getUsers } from "@/lib/firestore";
import type { User } from "@/lib/data";
import { projectSchema } from "./schema";
import { createProjectAction } from "./actions";

export default function CreateProjectPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getUsers();
        // Filter for users who can be managers or team members
        setUsers(usersData.filter(u => u.role === 'Agent' || u.role === 'Admin'));
      } catch (error) {
        console.error("Failed to fetch users", error);
        toast({
          title: "Error",
          description: "Could not load data for project managers and team members.",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [toast]);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      team: [],
    },
  });

  const onSubmit = (values: z.infer<typeof projectSchema>) => {
    startTransition(async () => {
      const result = await createProjectAction(values);
      if (result?.error) {
        toast({
          title: "Error creating project",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Project created successfully!",
          description: "Redirecting you to the new project...",
        });
        // Redirect is handled in the server action
      }
    });
  };
  
  const teamValue = form.watch("team") || [];
  const selectedTeamMembers = users.filter(user => teamValue.includes(user.id));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create New Project"
        description="Fill in the details below to create a new project."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Fill in the core details for your new project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q4 Marketing Campaign" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a brief summary of the project goals and objectives..." 
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Manager</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign a manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Deadline</FormLabel>
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
                                date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>
              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Members (Optional)</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full justify-start font-normal text-left h-auto min-h-10 py-2">
                            <span className="truncate">
                              {selectedTeamMembers.length > 0
                                ? selectedTeamMembers.map(u => u.name).join(', ')
                                : "Select team members"}
                            </span>
                          </Button>
                        </FormControl>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        <DropdownMenuLabel>Assign Team Members</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {users.map(user => (
                          <DropdownMenuCheckboxItem
                            key={user.id}
                            checked={field.value?.includes(user.id)}
                            onCheckedChange={(checked) => {
                              const currentTeam = field.value || [];
                              if (checked) {
                                field.onChange([...currentTeam, user.id]);
                              } else {
                                field.onChange(currentTeam.filter(id => id !== user.id));
                              }
                            }}
                          >
                            {user.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
                Create Project
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
