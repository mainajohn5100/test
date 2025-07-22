
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { TicketClient } from "@/components/tickets/ticket-client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader } from "lucide-react";
import Link from "next/link";
import { getUsers } from "@/lib/firestore";
import { useAuth } from '@/contexts/auth-context';
import type { Ticket, User } from '@/lib/data';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface StatusConfig {
  dbValue: string;
  title: string;
}

interface PageParams {
  status: string;
}

interface TicketsPageProps {
  params: PageParams;
}

const statusMap: Record<string, StatusConfig> = {
  'all': { dbValue: 'all', title: 'All Tickets' },
  'new-status': { dbValue: 'New', title: 'New Tickets' },
  'active': { dbValue: 'Active', title: 'Active Tickets' },
  'pending': { dbValue: 'Pending', title: 'Pending Tickets' },
  'on-hold': { dbValue: 'On Hold', title: 'On Hold Tickets' },
  'closed': { dbValue: 'Closed', title: 'Closed Tickets' },
  'terminated': { dbValue: 'Terminated', title: 'Terminated Tickets' },
};

export default function TicketsPage({ params }: TicketsPageProps): JSX.Element {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('search') || '';

  const [loading, setLoading] = React.useState<boolean>(true);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  const statusFilter: string = params.status || 'all';
  const statusConfig: StatusConfig | undefined = statusMap[statusFilter];
  const pageTitle: string = statusConfig ? statusConfig.title : statusMap['all'].title;
  const dbStatus: string = statusConfig ? statusConfig.dbValue : 'all';
  
  React.useEffect(() => {
    if (user) {
      // Fetch non-realtime data
      const fetchUsers = async () => {
        try {
          const usersData = await getUsers(user);
          setUsers(usersData);
        } catch (error) {
          console.error("Failed to fetch users", error);
          toast({ title: "Error", description: "Could not load users.", variant: "destructive" });
        }
      };
      fetchUsers();

      // Setup real-time listener for tickets
      setLoading(true);
      const ticketsCol = collection(db, 'tickets');
      const queries = [where("organizationId", "==", user.organizationId)];
      
      if (dbStatus !== 'all') {
        queries.push(where("status", "==", dbStatus));
      }
      
      if (user.role === 'Client') {
        queries.push(where("reporterEmail", "==", user.email));
      } else if (user.role === 'Agent') {
        queries.push(where("assignee", "==", user.name));
      }
      
      const q = query(ticketsCol, ...queries);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ticketsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as Ticket;
        });
        setTickets(ticketsData);
        setLoading(false);
      }, (error) => {
        console.error(`Error fetching real-time tickets with status "${dbStatus}":`, error);
        toast({ title: "Error", description: `Could not fetch tickets for status: ${dbStatus}.`, variant: "destructive" });
        setLoading(false);
      });
      
      // Cleanup listener on component unmount or when dependencies change
      return () => unsubscribe();
    }
  }, [user, dbStatus, toast]);


  if (loading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={pageTitle} description="View, manage, and filter your tickets.">
        <Link href="/tickets/new" passHref>
          <Button>
            <PlusCircle />
            New Ticket
          </Button>
        </Link>
      </PageHeader>
      
      <TicketClient 
        tickets={tickets}
        users={users}
        initialSearchTerm={initialSearchTerm}
      />
    </div>
  );
}
