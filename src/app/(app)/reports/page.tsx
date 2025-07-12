
'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getTickets, getProjects, getUsers } from "@/lib/firestore";
import { Download, Printer, Loader, ShieldAlert } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import type { Ticket, Project, User } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    TicketsByStatusChart, 
    ProjectsByStatusChart,
    TicketVolumeTrendsChart,
    TicketStatusTrendsChart, 
    TicketPriorityTrendsChart,
    AgentTicketStatusChart, 
    AgentResolutionTimeChart 
} from '@/components/reports/charts';

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    if (user) {
       if (user.role !== 'Admin') {
        setLoading(false);
        return;
      }
      const fetchData = async () => {
        setLoading(true);
        const [ticketsData, projectsData, usersData] = await Promise.all([
          getTickets(user),
          getProjects(user),
          getUsers()
        ]);
        setTickets(ticketsData);
        setProjects(projectsData);
        setUsers(usersData.filter(u => u.role === 'Agent' || u.role === 'Admin'));
        setLoading(false);
      };
      fetchData();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user.role !== 'Admin') {
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
    <div className="flex flex-col gap-8">
      <PageHeader title="Reports" description="Analyze trends and performance with detailed reports.">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Reports
        </Button>
        <Button disabled>
          <Download className="mr-2 h-4 w-4" />
          Download All
        </Button>
      </PageHeader>
      
        <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="agent-performance">Agent Performance</TabsTrigger>
                <TabsTrigger value="long-term-trends">Long-Term Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>General Tickets and Project Graphs</CardTitle>
                        <CardDescription>A high-level overview of ticket and project distributions.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <TicketsByStatusChart tickets={tickets} />
                        <ProjectsByStatusChart projects={projects} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="agent-performance" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Agent Performance</CardTitle>
                        <CardDescription>Metrics on agent workload and efficiency.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <AgentTicketStatusChart tickets={tickets} agents={users} />
                        <AgentResolutionTimeChart tickets={tickets} agents={users} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="long-term-trends" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Long-Term Trends</CardTitle>
                        <CardDescription>Analyze data patterns over longer periods.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <TicketVolumeTrendsChart tickets={tickets} />
                        <TicketStatusTrendsChart tickets={tickets} />
                        <TicketPriorityTrendsChart tickets={tickets} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
