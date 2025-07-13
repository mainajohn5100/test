
'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { TicketClient } from "@/components/tickets/ticket-client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader } from "lucide-react";
import Link from "next/link";
import { getTicketsByStatus, getUsers } from "@/lib/firestore";
import { useAuth } from '@/contexts/auth-context';
import type { Ticket, User } from '@/lib/data';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

const statusMap: { [key: string]: { dbValue: string; title: string } } = {
  'all': { dbValue: 'all', title: 'All Tickets' },
  'new-status': { dbValue: 'New', title: 'New Tickets' },
  'active': { dbValue: 'Active', title: 'Active Tickets' },
  'pending': { dbValue: 'Pending', title: 'Pending Tickets' },
  'on-hold': { dbValue: 'On Hold', title: 'On Hold Tickets' },
  'closed': { dbValue: 'Closed', title: 'Closed Tickets' },
  'terminated': { dbValue: 'Terminated', title: 'Terminated Tickets' },
};

export default function TicketsPage({ params }: { params: { status: string } }) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('search') || '';
  
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const statusFilter = params.status || 'all';
  const statusConfig = statusMap[statusFilter];

  const pageTitle = statusConfig ? statusConfig.title : statusMap['all'].title;
  const dbStatus = statusConfig ? statusConfig.dbValue : 'all';

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        const [ticketsData, usersData] = await Promise.all([
            getTicketsByStatus(dbStatus, user),
            getUsers(user)
        ]);
        setTickets(ticketsData);
        setUsers(usersData);
        setLoading(false);
      };
      fetchData();
    }
  }, [user, dbStatus]);

  if (loading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={pageTitle} description="Browse and manage all tickets.">
        <Link href="/tickets/new" passHref>
          <Button>
            <PlusCircle />
            New Ticket
          </Button>
        </Link>
      </PageHeader>
      <TicketClient tickets={tickets} users={users} initialSearchTerm={initialSearchTerm} />
    </div>
  );
}
