

'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader } from "lucide-react";
import Link from "next/link";
import { getUsers } from "@/lib/firestore";
import { ProjectClient } from "@/components/projects/project-client";
import { useAuth } from '@/contexts/auth-context';
import { useParams } from 'next/navigation';
import type { Project, User } from '@/lib/data';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// TypeScript interfaces
interface StatusConfig {
  dbValue: string;
  title: string;
}

const statusMap: Record<string, StatusConfig> = {
  'all': { dbValue: 'all', title: 'All Projects' },
  'new': { dbValue: 'New', title: 'New Projects' },
  'active': { dbValue: 'Active', title: 'Active Projects' },
  'on-hold': { dbValue: 'On Hold', title: 'On Hold Projects' },
  'completed': { dbValue: 'Completed', title: 'Completed Projects' },
};

export default function ProjectsByStatusPage(): JSX.Element {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  
  const statusFilter: string = (params?.status as string) || 'all';
  const statusConfig: StatusConfig | undefined = statusMap[statusFilter];
  const pageTitle: string = statusConfig ? statusConfig.title : statusMap['all'].title;
  const dbStatus: string = statusConfig ? statusConfig.dbValue : 'all';

  React.useEffect(() => {
    if (!user) return;

    // Fetch static user data once
    getUsers(user).then(setUsers).catch(error => {
        console.error("Failed to fetch users:", error);
        toast({ title: "Error", description: "Could not load user data.", variant: "destructive" });
    });

    setLoading(true);
    
    // Base query for projects
    const projectsCol = collection(db, 'projects');
    const queries = [where("organizationId", "==", user.organizationId)];

    // Role-based filtering
    if (user.role === 'Client') {
        queries.push(where("stakeholders", "array-contains", user.id));
    } else if (user.role === 'Agent') {
        // Agents see projects they manage or are a team member on.
        // Firestore doesn't support logical OR on different fields, so we'll need to fetch and merge.
        // For simplicity in this real-time switch, we'll fetch all and filter client-side for agents.
        // A more scalable solution might involve a denormalized user ID array on projects.
    }
    
    if (dbStatus !== 'all') {
        queries.push(where("status", "==", dbStatus));
    }

    const finalQuery = query(projectsCol, ...queries);

    const unsubscribe = onSnapshot(finalQuery, (snapshot) => {
        let projectsData = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt;
            const deadline = data.deadline;
            return { 
                id: doc.id,
                ...data,
                createdAt: createdAt instanceof Timestamp ? createdAt.toDate().toISOString() : createdAt,
                deadline: deadline instanceof Timestamp ? deadline.toDate().toISOString() : deadline,
            } as Project;
        });

        // Client-side filter for Agents due to Firestore query limitations
        if (user.role === 'Agent') {
            projectsData = projectsData.filter(p => p.manager === user.id || p.team.includes(user.id));
        }

        setProjects(projectsData);
        setLoading(false);
    }, (error) => {
        console.error(`Error fetching real-time projects for status "${dbStatus}":`, error);
        toast({ title: "Real-time Error", description: "Could not fetch projects automatically.", variant: "destructive" });
        setLoading(false);
    });

    return () => unsubscribe();

  }, [user, dbStatus, statusFilter, toast]);

  if (loading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={pageTitle}
        description={user.role === 'Client' ? 'A list of projects you are associated with.' : `Browse and manage all ${statusFilter.replace('-', ' ')} projects.`}
      >
        {(user.role === 'Admin' || user.role === 'Agent') && (
            <Link href="/projects/create" passHref>
            <Button>
                <PlusCircle />
                Create New Project
            </Button>
            </Link>
        )}
      </PageHeader>
      <ProjectClient projects={projects} users={users} />
    </div>
  );
}
