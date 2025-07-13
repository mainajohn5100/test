

'use client';

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileUp, Send, XCircle, Loader, Trash2 } from "lucide-react";
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
import { useSettings } from "@/contexts/settings-context";

export default function NewTicketPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const { customerCanSelectProject } = useSettings();

  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [files, setFiles] = useState([]);
  
  const [projects, setProjects] = React.useState([]);
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [projectsData, usersData] = await Promise.all([
            getProjects(user),
            getUsers(user)
          ]);
          // Filter projects to only include those where tickets are enabled
          const enabledProjects = projectsData.filter(p => p.ticketsEnabled !== false);
          setProjects(enabledProjects);
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


  const form = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      reporter: "",
      reporterId: "",
      email: "",
      priority: "medium",
      project: "",
      assignee: "",
      tags: [],
    },
  });
  
  React.useEffect(() => {
    if (user) {
      form.setValue('reporter', user.name);
      form.setValue('reporterId', user.id);
      form.setValue('email', user.email);
    }
  }, [user, form]);


  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (fileNameToRemove) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileNameToRemove));
  };

  const onSubmit = (values) => {
    startTransition(async () => {
      const formData = new FormData();
      
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(item => formData.append(key, item));
          } else {
            formData.append(key, value);
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

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    const currentTags = form.getValues("tags") || [];
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      form.setValue("tags", [...currentTags, trimmedTag]);
      setSuggestedTags(suggestedTags.filter(t => t !== trimmedTag));
    }
  };
    
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };
  
  const currentTags = form.watch("tags") || [];

  return (
    
        
            
                Create New Ticket
                Fill in the details below to submit a new ticket.
            
        
        
            
                
                    
                        Ticket Information
                        Fill in the details for the new support ticket.
                    
                    
                        
                            
                                
                                    Customer Name
                                
                                
                                    
                                
                                
                            
                            
                                
                                    Customer Email
                                
                                
                                    
                                
                                
                            
                        
                        
                            
                                Ticket Title
                            
                            
                                
                            
                            
                        
                        
                            
                                Description
                            
                            
                                
                                    Detailed description of the issue...
                                
                            
                            
                        
                        
                            
                                Attachments
                            
                            
                                
                                    
                                        
                                            
                                                
                                                    
                                                    
                                                        Click to upload
                                                         or drag and drop
                                                        Attach images or log files
                                                
                                                
                                            
                                        
                                    
                                
                                
                                    
                                        Selected files:
                                        
                                            
                                                
                                                
                                                    
                                                    
                                                        
                                                    
                                                
                                            
                                        
                                    
                                
                            
                        
                    
                
                
                    
                        Properties
                    
                    
                        
                            
                                Priority
                            
                            
                                
                                    
                                
                                
                                    
                                        Low
                                        Medium
                                        High
                                        Urgent
                                    
                                
                            
                            
                        
                        
                            
                                Project (Optional)
                            
                            
                                
                                    
                                
                                
                                    
                                        None
                                        {projects.map(p => {p.name}{p.name})}
                                    
                                
                            
                            
                        
                        
                            
                                Assignee (Optional)
                            
                            
                                
                                    
                                
                                
                                    
                                        Unassigned
                                        {users.map(u => {u.name}{u.name})}
                                    
                                
                            
                            
                        
                    
                
                
                    
                        Tags
                    
                    
                        
                            
                                Add Tags
                            
                            
                                
                            
                            
                                
                                    {tag}
                                    
                                
                            
                        
                        
                            
                                
                                    
                                        Suggest Tags with AI
                                    
                                    
                                        
                                            {tag}
                                        
                                    
                                
                            
                        
                    
                
                
                    
                        
                            
                                Submit Ticket
                            
                        
                    
                
            
        
    
  );
}
