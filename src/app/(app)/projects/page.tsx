
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader } from "lucide-react";
import Link from "next/link";
import { getUsers } from "@/lib/firestore";
import { ProjectClient } from "@/components/projects/project-client";
import { useAuth } from '@/contexts/auth-context';
import type { Project, User } from '@/lib/data';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function ProjectsPage(): JSX.Element {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  
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
        // This is now handled client-side in the component due to Firestore query limitations.
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
        console.error(`Error fetching real-time projects:`, error);
        toast({ title: "Real-time Error", description: "Could not fetch projects automatically.", variant: "destructive" });
        setLoading(false);
    });

    return () => unsubscribe();

  }, [user, toast]);

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
        title="Projects"
        description={user.role === 'Client' ? 'A list of projects you are associated with.' : `Browse and manage all projects.`}
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
