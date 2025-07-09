

'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/page-header";
import { ReportCharts } from "@/components/reports/charts";
import { Button } from "@/components/ui/button";
import { getTickets, getProjects } from "@/lib/firestore";
import { Download, Printer, Loader, ShieldAlert } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import type { Ticket, Project } from '@/lib/data';

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);

  React.useEffect(() => {
    if (user) {
       if (user.role !== 'Admin') {
        setLoading(false);
        return;
      }
      const fetchData = async () => {
        setLoading(true);
        const [ticketsData, projectsData] = await Promise.all([
          getTickets(user),
          getProjects(user)
        ]);
        setTickets(ticketsData);
        setProjects(projectsData);
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
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" description="Analyze trends and performance with detailed reports.">
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Reports
        </Button>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download All
        </Button>
      </PageHeader>
      <ReportCharts tickets={tickets} projects={projects} />
    </div>
  );
}
