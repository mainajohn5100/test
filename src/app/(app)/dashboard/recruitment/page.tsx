
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Loader, Layout, Search, MoreVertical } from "lucide-react";
import Link from "next/link";
import { getTickets, getProjects, getUsers } from "@/lib/firestore";
import { useAuth } from '@/contexts/auth-context';
import type { Ticket, Project, User, Task, Schedule } from '@/lib/data';
import { useSettings } from '@/contexts/settings-context';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { StatsCards } from '@/components/dashboard/recruitment/stats-cards';
import { TicketsChart } from '@/components/dashboard/recruitment/tickets-chart';
import { TicketsByStatusChart } from '@/components/dashboard/recruitment/tickets-by-status-chart';
import { TicketSourcesChart } from '@/components/dashboard/recruitment/ticket-sources-chart';
import { ProjectList } from '@/components/dashboard/recruitment/project-list';
import { TasksList } from '@/components/dashboard/recruitment/tasks-list';
import { ScheduleList } from '@/components/dashboard/recruitment/schedule-list';
import { tasks, schedule } from '@/lib/data'; // mock data

export default function RecruitmentDashboardPage() {
  const { user } = useAuth();
  const { loadingScreenStyle } = useSettings();
  const [loading, setLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  // Mock data for new components
  const [tasksData, setTasksData] = React.useState<Task[]>(tasks);
  const [scheduleData, setScheduleData] = React.useState<Schedule[]>(schedule);

  React.useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        const [ticketsData, projectsData, usersData] = await Promise.all([
          getTickets(user),
          getProjects(user),
          getUsers(user)
        ]);
        setTickets(ticketsData);
        setProjects(projectsData);
        setUsers(usersData);
        setLoading(false);
      };
      fetchData();
    }
  }, [user]);

  if (loading || !user) {
    if (loadingScreenStyle === 'skeleton') {
        return <DashboardSkeleton />;
    }
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 bg-[#F7F7F9] dark:bg-card p-4 rounded-lg">
       <PageHeader title="Dashboard">
         <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
            </Button>
            <Link href="/dashboard" passHref>
              <Button variant="outline">
                  <Layout />
                  Simple View
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
            </Button>
        </div>
      </PageHeader>
      
      <StatsCards tickets={tickets} />
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
            <TicketsChart tickets={tickets} />
            <ProjectList projects={projects} />
        </div>
        <div className="lg:col-span-2 space-y-6">
            <TicketsByStatusChart tickets={tickets} />
            <TicketSourcesChart tickets={tickets} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <TasksList tasks={tasksData} />
        </div>
        <div className="lg:col-span-2">
            <ScheduleList schedule={scheduleData} />
        </div>
      </div>
    </div>
  );
}
