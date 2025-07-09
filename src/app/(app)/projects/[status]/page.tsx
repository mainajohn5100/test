
// import { PageHeader } from "@/components/page-header";
// import { Button } from "@/components/ui/button";
// import { PlusCircle } from "lucide-react";
// import Link from "next/link";
// import { getProjects, getProjectsByStatus } from "@/lib/firestore";
// import { ProjectClient } from "@/components/projects/project-client";

// // This is crucial to prevent Next.js from caching the page and to ensure
// // fresh data is fetched from Firestore on every visit.
// export const dynamic = 'force-dynamic';

// const statusMap: { [key: string]: { dbValue: string; title: string } } = {
//   'all': { dbValue: 'all', title: 'All Projects' },
//   'new': { dbValue: 'New', title: 'New Projects' },
//   'active': { dbValue: 'Active', title: 'Active Projects' },
//   'on-hold': { dbValue: 'On Hold', title: 'On Hold Projects' },
//   'completed': { dbValue: 'Completed', title: 'Completed Projects' },
// };

// export default async function ProjectsByStatusPage({ params }: { params: { status: string } }) {
//     const statusFilter = params.status || 'all';
//     const statusConfig = statusMap[statusFilter];

//     // If the status from the URL is not in our map, default to 'all'.
//     const pageTitle = statusConfig ? statusConfig.title : statusMap['all'].title;
//     const dbStatus = statusConfig ? statusConfig.dbValue : 'all';
    
//     const projects = await (async () => {
//         if (dbStatus === 'all') {
//             return getProjects();
//         }
//         return getProjectsByStatus(dbStatus);
//     })();

//   return (
//     <div className="flex flex-col gap-6">
//       <PageHeader
//         title={pageTitle}
//         description={`Browse and manage all ${statusFilter.replace('-', ' ')} projects.`}
//       >
//         <Link href="/projects/create" passHref>
//           <Button>
//               <PlusCircle />
//               Create New Project
//           </Button>
//         </Link>
//       </PageHeader>
//       <ProjectClient projects={projects} />
//     </div>
//   );
// }

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getProjects, getProjectsByStatus } from "@/lib/firestore";
import { ProjectClient } from "@/components/projects/project-client";

// This is crucial to prevent Next.js from caching the page and to ensure
// fresh data is fetched from Firestore on every visit.
export const dynamic = 'force-dynamic';

interface StatusConfig {
  dbValue: string;
  title: string;
}

interface PageParams {
  status: string;
}

interface ProjectsByStatusPageProps {
  params: Promise<PageParams>;
}

const statusMap: Record<string, StatusConfig> = {
  'all': { dbValue: 'all', title: 'All Projects' },
  'new': { dbValue: 'New', title: 'New Projects' },
  'active': { dbValue: 'Active', title: 'Active Projects' },
  'on-hold': { dbValue: 'On Hold', title: 'On Hold Projects' },
  'completed': { dbValue: 'Completed', title: 'Completed Projects' },
};

export default async function ProjectsByStatusPage({ params }: ProjectsByStatusPageProps): Promise<JSX.Element> {
  // Await the params Promise
  const resolvedParams: PageParams = await params;
  
  console.log('🔍 Raw params received:', resolvedParams);
  
  const statusFilter: string = resolvedParams.status || 'all';
  const statusConfig: StatusConfig | undefined = statusMap[statusFilter];
  
  console.log('🎯 Status filter resolved to:', statusFilter);
  console.log('🗺️ Status config:', statusConfig);

  // If the status from the URL is not in our map, default to 'all'.
  const pageTitle: string = statusConfig ? statusConfig.title : statusMap['all'].title;
  const dbStatus: string = statusConfig ? statusConfig.dbValue : 'all';

  console.log(`🎫 Fetching projects for status: "${dbStatus}" (URL param: "${statusFilter}")`);
  
  const projects = await (async () => {
    if (dbStatus === 'all') {
      return getProjects();
    }
    return getProjectsByStatus(dbStatus);
  })();

  console.log(`📊 Fetched ${projects.length} projects for status "${dbStatus}":`, projects);

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