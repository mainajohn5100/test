
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getProjects, getProjectsByStatus } from "@/lib/firestore";
import { ProjectClient } from "@/components/projects/project-client";

// This is crucial to prevent Next.js from caching the page and to ensure
// fresh data is fetched from Firestore on every visit.
export const dynamic = 'force-dynamic';

const statusMap: { [key: string]: { dbValue: string; title: string } } = {
  'all': { dbValue: 'all', title: 'All Projects' },
  'new': { dbValue: 'New', title: 'New Projects' },
  'active': { dbValue: 'Active', title: 'Active Projects' },
  'on-hold': { dbValue: 'On Hold', title: 'On Hold Projects' },
  'completed': { dbValue: 'Completed', title: 'Completed Projects' },
};

export default async function ProjectsByStatusPage({ params }: { params: { status: string } }) {
    const statusFilter = params.status || 'all';
    const statusConfig = statusMap[statusFilter];

    // If the status from the URL is not in our map, default to 'all'.
    const pageTitle = statusConfig ? statusConfig.title : statusMap['all'].title;
    const dbStatus = statusConfig ? statusConfig.dbValue : 'all';
    
    const projects = await (async () => {
        if (dbStatus === 'all') {
            return getProjects();
        }
        return getProjectsByStatus(dbStatus);
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
      <ProjectClient projects={projects} />
    </div>
  );
}
