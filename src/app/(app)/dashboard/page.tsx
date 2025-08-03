
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTickets } from "@/components/dashboard/recent-tickets";
import { TicketsOverviewChart } from "@/components/dashboard/tickets-overview-chart";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader } from "lucide-react";
import Link from "next/link";
import { AvgResolutionTimeChart } from "@/components/dashboard/avg-resolution-time-chart";
import { getProjects, getUsers, getRecentNotifications } from "@/lib/firestore";
import { format, differenceInHours, isToday, eachDayOfInterval, subDays, isValid } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import type { Ticket, Project, User } from '@/lib/data';
import { useSettings } from '@/contexts/settings-context';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { htmlToText } from 'html-to-text';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { excludeClosedTickets, loadingScreenStyle } = useSettings();
  const [loading, setLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const greeting = "Here's a snapshot of your helpdesk activity.";

  React.useEffect(() => {
    if (user) {
      const fetchStaticData = async () => {
          try {
              const [projectsData, usersData] = await Promise.all([
                  getProjects(user),
                  getUsers(user),
              ]);
              setProjects(projectsData);
              setUsers(usersData);
          } catch (e) {
              console.error("Failed to fetch static data:", e);
              toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
          }
      };
      
      fetchStaticData();

      const ticketsCol = collection(db, 'tickets');
      const queries = [where("organizationId", "==", user.organizationId)];
      
      if (user.role === 'Agent') {
        queries.push(where("assignee", "==", user.name));
      } else if (user.role === 'Client') {
        queries.push(where("reporterEmail", "==", user.email));
      }
      
      const q = query(ticketsCol, ...queries);

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const ticketsData = snapshot.docs.map(doc => {
            const data = doc.data();
            // Manually convert timestamps to ISO strings for consistency
            const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
            const updatedAt = (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
            return { id: doc.id, ...data, createdAt, updatedAt } as Ticket;
        });

        setTickets(ticketsData);
        setLoading(false);

      }, error => {
        console.error("Error fetching real-time tickets: ", error);
        toast({ title: "Error", description: "Could not fetch tickets in real-time.", variant: "destructive" });
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, toast]);
  
  const displayedTickets = React.useMemo(() => {
    if (excludeClosedTickets) {
      return tickets.filter(t => t.status !== 'Closed' && t.status !== 'Terminated');
    }
    return tickets;
  }, [tickets, excludeClosedTickets]);

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
  
  const userMap = new Map(users.map(u => [u.id, u.name]));
  const userMapByName = new Map(users.map(u => [u.name, u]));

  const ticketsByStatus = displayedTickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ticketsOverviewData = Object.entries(ticketsByStatus).map(([name, value]) => ({ name, value }));
  
  const closedTickets = tickets.filter(t => t.status === 'Closed' || t.status === 'Terminated');
  const dailyResolutionTimes: { [key: string]: { totalHours: number; count: number } } = {};
  
  const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
  });

  closedTickets.forEach(ticket => {
    if (!ticket.updatedAt || !ticket.createdAt) return;

    const resolvedAt = new Date(ticket.updatedAt);
    const createdAt = new Date(ticket.createdAt);

    if (!isValid(resolvedAt) || !isValid(createdAt)) return;

    const dayKey = format(resolvedAt, 'MMM d');

    if (last30Days.some(d => format(d, 'MMM d') === dayKey)) {
        const resolutionHours = differenceInHours(resolvedAt, createdAt);
        
        if (!dailyResolutionTimes[dayKey]) {
            dailyResolutionTimes[dayKey] = { totalHours: 0, count: 0 };
        }
        dailyResolutionTimes[dayKey].totalHours += resolutionHours;
        dailyResolutionTimes[dayKey].count++;
    }
  });

  const avgResolutionTimeData = last30Days.map(day => {
    const dayKey = format(day, 'MMM d');
    if (dailyResolutionTimes[dayKey] && dailyResolutionTimes[dayKey].count > 0) {
      const avg = dailyResolutionTimes[dayKey].totalHours / dailyResolutionTimes[dayKey].count;
      return { name: dayKey, hours: parseFloat(avg.toFixed(1)) };
    }
    return { name: dayKey, hours: null };
  });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={`Welcome, ${user.name}!`} description={greeting}>
        <div className="flex items-center gap-2">
            <Link href="/tickets/new" passHref>
            <Button>
                <PlusCircle />
                New Ticket
            </Button>
            </Link>
        </div>
      </PageHeader>
      
      <StatsCards tickets={displayedTickets} projects={projects} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentTickets tickets={displayedTickets} userMap={userMapByName} />
        </div>
        <div className="flex flex-col gap-4">
          <TicketsOverviewChart data={ticketsOverviewData} />
          <AvgResolutionTimeChart data={avgResolutionTimeData} />
        </div>
      </div>
    </div>
  );
}
