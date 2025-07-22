
'use client';

import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ListFilter, Search, Flag, User as UserIcon } from "lucide-react";
import { format, isPast } from 'date-fns';
import Link from "next/link";
import type { Project, Task, User } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { getTasksByProject } from "@/lib/firestore";
import { Progress } from "../ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface ProjectClientProps {
  projects: Project[];
  users: User[];
}

const projectStatusVariantMap: { [key: string]: string } = {
  'Active': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  'Completed': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  'New': 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
};

const statusOrder: { [key in Project['status']]: number } = {
  'Active': 0,
  'New': 1,
  'On Hold': 2,
  'Completed': 3,
};

function ProjectCard({ project, managerName }: { project: Project, managerName: string }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    
    useEffect(() => {
        getTasksByProject(project.id).then(setTasks);
    }, [project.id]);

    const completedTasks = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);
    const taskProgress = useMemo(() => tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0, [completedTasks, tasks]);
    const isOverdue = isPast(new Date(project.deadline));

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-headline">{project.name}</CardTitle>
                    <Badge className={projectStatusVariantMap[project.status] || 'bg-gray-100'}>{project.status}</Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <span>Due: {format(new Date(project.deadline), 'PP')}</span>
                    {isOverdue && project.status !== 'Completed' && (
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Flag className="h-4 w-4 text-destructive" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>This project is past its deadline.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Progress</p>
                    <Progress value={taskProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{completedTasks} of {tasks.length} tasks completed ({taskProgress.toFixed(0)}%)</p>
                </div>
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Budget</p>
                        <p className="text-sm text-muted-foreground">Kes {project.budget?.toLocaleString() ?? 'N/A'}</p>
                    </div>
                     <div className="space-y-1 text-right">
                        <p className="text-sm font-medium text-foreground">Manager</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 justify-end">
                            <UserIcon className="h-3 w-3" />
                            {managerName}
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Link href={`/projects/view/${project.id}`} passHref className="w-full">
                <Button variant="outline" className="w-full">
                    View Project
                    <ArrowRight className="ml-2" />
                </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

export function ProjectClient({ projects, users }: ProjectClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);

  const filteredAndSortedProjects = useMemo(() => {
    let displayProjects = projects ? [...projects] : [];

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      displayProjects = displayProjects.filter(p => {
        const managerName = userMap.get(p.manager) || '';
        return p.name.toLowerCase().includes(lowercasedTerm) ||
               (p.description && p.description.toLowerCase().includes(lowercasedTerm)) ||
               managerName.toLowerCase().includes(lowercasedTerm);
      });
    }

    displayProjects.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (sortBy === 'status') return statusOrder[a.status] - statusOrder[b.status];
      return 0;
    });

    return displayProjects;
  }, [projects, searchTerm, sortBy, userMap]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, manager..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
                <ListFilter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="deadline">By Deadline</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProjects.length > 0 ? filteredAndSortedProjects.map((project) => {
          const managerName = userMap.get(project.manager) || 'Unassigned';
          return <ProjectCard key={project.id} project={project} managerName={managerName} />
        }) : (
            <div className="md:col-span-2 lg:col-span-3 text-center py-10 text-muted-foreground">
                <p>No projects found with the current filters.</p>
            </div>
        )}
      </div>
    </>
  );
}
