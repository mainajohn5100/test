
'use client';

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ListFilter, Search } from "lucide-react";
import { format } from 'date-fns';
import Link from "next/link";
import type { Project } from "@/lib/data";
import { Button } from "@/components/ui/button";

interface ProjectClientProps {
  projects: Project[];
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

export function ProjectClient({ projects }: ProjectClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedProjects = useMemo(() => {
    let displayProjects = projects ? [...projects] : [];

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      displayProjects = displayProjects.filter(p => 
        p.name.toLowerCase().includes(lowercasedTerm) ||
        (p.description && p.description.toLowerCase().includes(lowercasedTerm))
      );
    }

    displayProjects.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (sortBy === 'status') return statusOrder[a.status] - statusOrder[b.status];
      return 0;
    });

    return displayProjects;
  }, [projects, searchTerm, sortBy]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or description..." 
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
        {filteredAndSortedProjects.length > 0 ? filteredAndSortedProjects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-headline">{project.name}</CardTitle>
                  <Badge className={projectStatusVariantMap[project.status] || 'bg-gray-100'}>{project.status}</Badge>
              </div>
              <CardDescription>
                Created: {format(new Date(project.createdAt), 'PP')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{project.description || "A brief summary of the project goals and objectives. This provides a quick overview for anyone looking at the project list."}</p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Deadline</p>
                <p className="text-sm text-muted-foreground">{format(new Date(project.deadline), 'PP')}</p>
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
        )) : (
            <div className="md:col-span-2 lg:col-span-3 text-center py-10 text-muted-foreground">
                <p>No projects found with the current filters.</p>
            </div>
        )}
      </div>
    </>
  );
}
