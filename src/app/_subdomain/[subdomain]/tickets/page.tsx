
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

export default function TicketsPage(): JSX.Element {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('search') || '';

  const [loading, setLoading] = React.useState<boolean>(true);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  
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
        console.error(`Error fetching real-time tickets:`, error);
        toast({ title: "Error", description: `Could not fetch tickets.`, variant: "destructive" });
        setLoading(false);
      });
      
      // Cleanup listener on component unmount or when dependencies change
      return () => unsubscribe();
    }
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
      <PageHeader title="Tickets" description="View, manage, and filter all your tickets.">
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
