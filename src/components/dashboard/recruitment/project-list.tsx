
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Code, Briefcase, BarChart2, Shield } from "lucide-react";
import type { Project } from "@/lib/data";

interface ProjectListProps {
  projects: Project[];
}

const getProjectIcon = (name: string) => {
  if (name.toLowerCase().includes('api')) return <Code className="h-6 w-6 text-indigo-500" />;
  if (name.toLowerCase().includes('website')) return <Briefcase className="h-6 w-6 text-sky-500" />;
  if (name.toLowerCase().includes('report')) return <BarChart2 className="h-6 w-6 text-amber-500" />;
  return <Shield className="h-6 w-6 text-slate-500" />;
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <Card className="rounded-2xl border-none">
      <CardHeader>
        <CardTitle>Current Projects ({projects.length})</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.slice(0, 4).map(project => (
          <Card key={project.id} className="rounded-xl border-none bg-muted/50 dark:bg-muted/20 p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-background rounded-lg">
                {getProjectIcon(project.name)}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="font-semibold">{project.name}</h3>
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-normal">{project.status}</Badge>
            </div>
            <div className="flex items-end justify-between">
                <p className="text-lg font-bold text-green-600">${(project.budget || 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{project.team.length} Members</p>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
