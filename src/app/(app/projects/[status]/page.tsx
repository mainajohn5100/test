
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getProjects } from "@/lib/firestore";
import { ProjectClient } from "@/components/projects/project-client";

// This is crucial to prevent Next.js from caching the page and to ensure
// fresh data is fetched from Firestore on every visit.
export const dynamic = 'force-dynamic';

export default async function ProjectsByStatusPage({ params }: { params: { status: string } }) {
    const statusFilter = params.status || 'all';

    let pageTitle = "All Projects";
    let pageDescription = "Browse and manage all your projects.";

    if (statusFilter && statusFilter !== 'all') {
        const normalizedStatus = statusFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        pageTitle = `${normalizedStatus} Projects`;
        pageDescription = `Browse and manage all ${statusFilter.replace('-', ' ')} projects.`
    }

    // Fetch all projects. Filtering will be handled on the client.
    const projects = await getProjects();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
      >
        <Link href="/projects/create" passHref>
          <Button>
              <PlusCircle />
              Create New Project
          </Button>
        </Link>
      </PageHeader>
      <ProjectClient projects={projects} initialStatusFilter={statusFilter} />
    </div>
  );
}
