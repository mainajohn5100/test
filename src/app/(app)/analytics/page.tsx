
'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getTickets, getProjects, getUsers } from "@/lib/firestore";
import { Loader, ShieldAlert } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import type { Ticket, Project, User } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewCharts } from '@/components/analytics/overview-charts';
import { AgentPerformanceCharts } from '@/components/analytics/agent-charts';
import { TicketAnalysisCharts } from '@/components/analytics/ticket-charts';
import { ReportsTab } from '@/components/analytics/reports-tab';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [activeTab, setActiveTab] = React.useState("overview");

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
          getUsers(user)
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
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
          <div className="flex flex-col items-center justify-center text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground max-w-sm mt-2">
              You do not have permission to view this page.
            </p>
            <Link href="/dashboard" passHref>
                <Button className="mt-6">Return to Dashboard</Button>
            </Link>
          </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Analytics" description="Analyze trends and performance across your helpdesk." />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <OverviewCharts tickets={tickets} projects={projects} users={users} />
        </TabsContent>
        <TabsContent value="tickets" className="mt-6">
          <TicketAnalysisCharts tickets={tickets} />
        </TabsContent>
        <TabsContent value="agents" className="mt-6">
          <AgentPerformanceCharts tickets={tickets} agents={users} />
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
