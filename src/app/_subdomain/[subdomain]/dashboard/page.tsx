

'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTickets } from "@/components/dashboard/recent-tickets";
import { TicketsByChannelChart } from "@/components/dashboard/tickets-by-channel-chart";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader } from "lucide-react";
import Link from "next/link";
import { TicketVolumeChart } from "@/components/dashboard/ticket-volume-chart";
import { getProjects, getUsers, getRecentNotifications } from "@/lib/firestore";
import { format, differenceInHours, isToday, eachDayOfInterval, subDays, isValid } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import type { Ticket, Project, User } from '@/lib/data';
import { useSettings } from '@/contexts/settings-context';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { htmlToText } from 'html-to-text';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { excludeClosedTickets } = useSettings();
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
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const userMapByName = new Map(users.map(u => [u.name, u]));

  return (
    <div className="flex flex-col gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <TicketVolumeChart tickets={tickets} />
        </div>
        <div className="lg:col-span-1">
          <TicketsByChannelChart tickets={tickets} />
        </div>
      </div>
      
       <div className="grid grid-cols-1">
        <RecentTickets tickets={displayedTickets} userMap={userMapByName} />
       </div>
    </div>
  );
}
