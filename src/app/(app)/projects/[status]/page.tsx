
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getProjects, getProjectsByStatus } from "@/lib/firestore";
import { ProjectClient } from "@/components/projects/project-client";

// This is crucial to prevent Next.js from caching the page and to ensure
// fresh data is fetched from Firestore on every visit.
export const dynamic = 'force-dynamic';

export default async function ProjectsByStatusPage({ params }: { params: { status: string } }) {
    const statusFilter = params.status || 'all';

    let pageTitle = "All Projects";
    let normalizedStatus = 'all';

    if (statusFilter && statusFilter !== 'all') {
        normalizedStatus = statusFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        pageTitle = `${normalizedStatus} Projects`;
    }
    
    const projects = await (async () => {
        if (normalizedStatus === 'all') {
            return getProjects();
        }
        return getProjectsByStatus(normalizedStatus);
    })();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={pageTitle}
        description={`Browse and manage all ${statusFilter.replace('-', ' ')} projects.`}
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
