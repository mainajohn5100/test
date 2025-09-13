
'use client';

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileUp, Send, XCircle, Loader, Trash2, PlusCircle, UserPlus } from "lucide-react";
import React, { useState, useTransition, useEffect } from "react";
import { suggestTags } from "@/ai/flows/suggest-tags";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createTicketAction } from "./actions";
import { ticketSchema } from "./schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getProjects, getUsers } from "@/lib/firestore";
import type { Project, User, Ticket } from "@/lib/data";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateUserForm } from "@/app/(app)/users/create-user-form";
import { Combobox } from "@/components/ui/combobox";
import { useSearchParams } from "next/navigation";
import  TiptapEditor  from "@/components/tiptap-editor";
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';

const categories: Ticket['category'][] = ['General', 'Support', 'Advertising', 'Billing'];

export default function NewTicketPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const { clientCanSelectProject, projectsEnabled } = useSettings();

  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isCreateUserOpen, setCreateUserOpen] = React.useState(false);
  const [clientUsers, setClientUsers] = React.useState<User[]>([]);
  const [assignableUsers, setAssignableUsers] = React.useState<User[]>([]);
  
  const initialProject = searchParams.get('project');

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      reporter: user?.name || "",
      reporterId: user?.id || "",
      email: user?.email || "",
      priority: "medium",
      category: "General",
      project: initialProject || "none",
      assignee: "unassigned",
      tags: [],
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Provide a detailed description of the issue..." }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: form.watch('description'),
    onUpdate({ editor }) {
      form.setValue('description', editor.getHTML(), { shouldValidate: true });
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base max-w-none',
      },
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue('reporter', user.name);
      form.setValue('reporterId', user.id);
      form.setValue('email', user.email);
    }
    if (initialProject) {
      form.setValue('project', initialProject);
    }
  }, [user, initialProject, form]);


  React.useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [projectsData, usersData] = await Promise.all([
            getProjects(user),
            getUsers(user)
          ]);

          const enabledProjects = projectsData.filter(p => p.ticketsEnabled !== false && p.status !== 'Completed');
          setProjects(enabledProjects);

          setClientUsers(usersData.filter(u => u.role === 'Client'));
          setAssignableUsers(usersData.filter(u => u.role === 'Agent' || u.role === 'Admin'));

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
  }, [user, toast, isCreateUserOpen]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (fileNameToRemove: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileNameToRemove));
  };

  const onSubmit = (values: z.infer<typeof ticketSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(item => formData.append(key, item));
          } else {
            formData.append(key as string, value as string);
          }
        }
      });
      
      files.forEach(file => {
        formData.append('attachments', file);
      });

      const result = await createTicketAction(formData);
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
      const currentTagsValue = form.getValues("tags") || [];
      const newSuggestions = result.tags.filter(t => !currentTagsValue.includes(t));
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
    const currentTagsValue = form.getValues("tags") || [];
    if (trimmedTag && !currentTagsValue.includes(trimmedTag)) {
      form.setValue("tags", [...currentTagsValue, trimmedTag]);
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
    const currentTagsValue = form.getValues("tags") || [];
    form.setValue("tags", currentTagsValue.filter(tag => tag !== tagToRemove));
  };
  
  const currentTags = form.watch("tags") || [];

  const isAgentOrAdmin = user?.role === 'Agent' || user?.role === 'Admin';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create New Ticket"
        description="Fill in the details below to submit a new ticket."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Information</CardTitle>
                  <CardDescription>Fill in the details for the new support ticket.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isAgentOrAdmin && (
                    <FormField
                      control={form.control}
                      name="reporterId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Client</FormLabel>
                          <div className="flex items-center gap-2">
                             <Combobox
                                options={clientUsers.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))}
                                selectedValue={field.value}
                                onSelect={(value) => {
                                  const selectedUser = clientUsers.find(u => u.id === value);
                                  if (selectedUser) {
                                    form.setValue('reporterId', selectedUser.id, { shouldValidate: true });
                                    form.setValue('reporter', selectedUser.name);
                                    form.setValue('email', selectedUser.email);
                                  }
                                }}
                                placeholder="Select a client..."
                                searchPlaceholder="Search clients..."
                                notFoundMessage="No client found."
                              />
                              <Dialog open={isCreateUserOpen} onOpenChange={setCreateUserOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Create New Client</DialogTitle>
                                    <DialogDescription>
                                      Create a new client account. They will be notified to set up their password.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <CreateUserForm setOpen={setCreateUserOpen} />
                                </DialogContent>
                              </Dialog>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Login button not working" {...field} />
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
                          <TiptapEditor
                            editor={editor}
                            content={field.value}
                            onChange={field.onChange}
                            placeholder="Provide a detailed description of the issue..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Attachments (Optional)</FormLabel>
                    <FormControl>
                        <div className="relative w-full">
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                                    <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">Attach images or log files (up to 5MB each)</p>
                                </div>
                                <Input id="file-upload" type="file" className="hidden" multiple onChange={handleFileChange} />
                            </label>
                        </div>
                    </FormControl>
                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium">Selected files:</p>
                            <div className="flex flex-wrap gap-2">
                            {files.map((file, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                    <button type="button" onClick={() => removeFile(file.name)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                    </button>
                                </Badge>
                            ))}
                            </div>
                        </div>
                    )}
                  </FormItem>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                    <CardTitle>Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
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
                  {projectsEnabled && (user?.role !== 'Client' || clientCanSelectProject) && (
                  <FormField
                    control={form.control}
                    name="project"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to a project" />
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
                  )}
                  {user?.role !== 'Client' && (
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
                            {assignableUsers.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                    <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel htmlFor="tags">Add Tags</FormLabel>
                    <Input 
                      id="tags" 
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Type a tag and press Enter"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-6">
                    {currentTags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            <XCircle className="h-4 w-4" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div>
                    <Button type="button" variant="outline" size="sm" onClick={handleSuggestTags} disabled={isSuggesting}>
                      {isSuggesting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Suggest Tags with AI
                    </Button>
                    {suggestedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {suggestedTags.map(tag => (
                          <Button key={tag} size="sm" variant="outline" onClick={() => addTag(tag)}>
                            {tag}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit Ticket
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
