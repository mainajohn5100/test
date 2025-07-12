
'use client';

import React, { useEffect } from 'react';
import { PageHeader } from "@/components/page-header";
import { TicketClient } from "@/components/tickets/ticket-client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader } from "lucide-react";
import Link from "next/link";
import { getTicketsByStatus, getUsers } from "@/lib/firestore";
import { useAuth } from '@/contexts/auth-context';
import type { Ticket, User } from '@/lib/data';
import { setErrorMap } from 'zod';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

// TypeScript interfaces
interface StatusConfig {
  dbValue: string;
  title: string;
}

interface PageParams {
  status: string;
}

interface TicketsPageProps {
  params: Promise<PageParams>;
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
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [loading, setLoading] = React.useState<boolean>(true);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [resolvedParams, setResolvedParams] = React.useState<PageParams | null>(null);

  // Resolve the params Promise in useEffect
  React.useEffect(() => {
    const resolveParams = async (): Promise<void> => {
      const resolved: PageParams = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  const statusFilter: string = resolvedParams?.status || 'all';
  const statusConfig: StatusConfig | undefined = statusMap[statusFilter];
  const pageTitle: string = statusConfig ? statusConfig.title : statusMap['all'].title;
  const dbStatus: string = statusConfig ? statusConfig.dbValue : 'all';
  
  React.useEffect(() => {
    if (user && resolvedParams) {
      const fetchData = async (): Promise<void> => {
        setLoading(true);
        const [ticketsData, usersData]: [Ticket[], User[]] = await Promise.all([
          getTicketsByStatus(dbStatus, user),
          getUsers()
        ]);
        setTickets(ticketsData);
        setUsers(usersData);
        setLoading(false);
      };
      fetchData();
    }
  }, [user, dbStatus, resolvedParams]);


  if (loading || !user || !resolvedParams) {
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
        initialSearchTerm={initialSearch}
      />
    </div>
  );
}
