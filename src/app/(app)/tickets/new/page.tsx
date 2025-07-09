
'use client';

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileUp, Send, XCircle, Loader } from "lucide-react";
import React, { useState, useTransition } from "react";
import { suggestTags } from "@/ai/flows/suggest-tags";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createTicketAction } from "./actions";
import { ticketSchema } from "./schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getProjects, getUsers } from "@/lib/firestore";
import type { Project, User } from "@/lib/data";
import { useAuth } from "@/contexts/auth-context";

export default function NewTicketPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [projectsData, usersData] = await Promise.all([
            getProjects(user),
            getUsers()
          ]);
          setProjects(projectsData);
          // Filter for users who can be assigned tickets
          setUsers(usersData.filter(u => u.role === 'Agent' || u.role === 'Admin'));
        } catch (error) {
          console.error("Failed to fetch projects or users", error);
          toast({
            title: "Error",
            description: "Could not load data for projects and assignees.",
            variant: "destructive",
          });
        }
      };
      fetchData();
    }
  }, [user, toast]);


  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      reporter: "",
      email: "",
      priority: "medium",
      project: "",
      assignee: "",
      tags: [],
    },
  });

  const onSubmit = (values: z.infer<typeof ticketSchema>) => {
    startTransition(async () => {
      const result = await createTicketAction(values);
      if (result?.error) {
        toast({
          title: "Error creating ticket",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ticket created successfully!",
          description: "Redirecting you to the new ticket...",
        });
        // Redirect is handled in the server action
      }
    });
  };

  const handleSuggestTags = async () => {
    const description = form.getValues("description");
    if (!description) {
      toast({
        title: "Description needed",
        description: "Please write a description before suggesting tags.",
        variant: "destructive",
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestTags({ ticketContent: description });
      const currentTags = form.getValues("tags") || [];
      const newSuggestions = result.tags.filter(t => !currentTags.includes(t));
      setSuggestedTags(newSuggestions);
      if(newSuggestions.length === 0) {
        toast({ title: "No new tags suggested." });
      }
    } catch (error) {
      console.error("Error suggesting tags:", error);
      toast({
        title: "Error",
        description: "Could not suggest tags at this time.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    const currentTags = form.getValues("tags") || [];
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      form.setValue("tags", [...currentTags, trimmedTag]);
      setSuggestedTags(suggestedTags.filter(t => t !== trimmedTag));
    }
  };
    
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };
  
  const currentTags = form.watch("tags") || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create New Ticket"
        description="Fill in the details below to submit a new ticket."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
                <CardDescription>Fill in the details for the new support ticket.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reporter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
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
                        <FormLabel>Customer Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Login issue on website" {...field} />
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
                          placeholder="Detailed description of the issue..." 
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                          </div>
                          <Input id="dropzone-file" type="file" className="hidden" disabled />
                      </label>
                  </div> 
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Set priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {projects.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee (Optional)</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to an agent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {users.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="tags-input">Add Tags</Label>
                          <Input 
                            id="tags-input" 
                            placeholder="Type & press Enter" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagInputKeyDown}
                          />
                          <div className="flex flex-wrap gap-2 pt-2">
                            {currentTags.map(tag => (
                              <Badge key={tag} variant="secondary" className="flex items-center gap-1.5">
                                {tag}
                                <XCircle className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                              </Badge>
                            ))}
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleSuggestTags} disabled={isSuggesting || isPending}>
                            {isSuggesting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Suggest Tags with AI
                          </Button>
                          {suggestedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {suggestedTags.map(tag => (
                                    <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => addTag(tag)}>+ {tag}</Badge>
                                ))}
                            </div>
                          )}
                      </div>
                  </div>
              </CardContent>
            </Card>
            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
              Submit Ticket
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
