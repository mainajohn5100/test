
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getProjectsByStatus } from "@/lib/firestore";
import { ProjectClient } from "@/components/projects/project-client";
import { useAuth } from '@/contexts/auth-context';
import type { Project } from '@/lib/data';

const statusMap: { [key: string]: { dbValue: string; title: string } } = {
  'all': { dbValue: 'all', title: 'All Projects' },
  'new': { dbValue: 'New', title: 'New Projects' },
  'active': { dbValue: 'Active', title: 'Active Projects' },
  'on-hold': { dbValue: 'On Hold', title: 'On Hold Projects' },
  'completed': { dbValue: 'Completed', title: 'Completed Projects' },
};

export default function ProjectsByStatusPage({ params }: { params: { status: string } }) {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [projects, setProjects] = React.useState<Project[]>([]);

  const statusFilter = params.status || 'all';
  const statusConfig = statusMap[statusFilter];
  const pageTitle = statusConfig ? statusConfig.title : statusMap['all'].title;
  const dbStatus = statusConfig ? statusConfig.dbValue : 'all';

  React.useEffect(() => {
    if (user) {
      if (user.role === 'Customer') {
        setProjects([]);
        setLoading(false);
        return;
      }

      const fetchData = async () => {
        setLoading(true);
        const projectsData = await getProjectsByStatus(dbStatus, user);
        setProjects(projectsData);
        setLoading(false);
      };
      fetchData();
    }
  }, [user, dbStatus]);

  if (loading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user.role === 'Customer') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
          <Button asChild className="mt-4">
              <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={pageTitle}
        description={`Browse and manage all ${statusFilter.replace('-', ' ')} projects.`}
      >
        <Link href="/projects/create" passHref>
          <Button>
              <PlusCircle />
              Create New Project
          </Button>
        </Link>
      </PageHeader>
      <ProjectClient projects={projects} />
    </div>
  );
}
