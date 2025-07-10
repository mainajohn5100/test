
// // 'use client';

// // import React from 'react';
// // import { PageHeader } from "@/components/page-header";
// // import { Button } from "@/components/ui/button";
// // import { PlusCircle, Loader } from "lucide-react";
// // import Link from "next/link";
// // import { getProjectsByStatus } from "@/lib/firestore";
// // import { ProjectClient } from "@/components/projects/project-client";
// // import { useAuth } from '@/contexts/auth-context';
// // import type { Project } from '@/lib/data';

// // const statusMap: { [key: string]: { dbValue: string; title: string } } = {
// //   'all': { dbValue: 'all', title: 'All Projects' },
// //   'new': { dbValue: 'New', title: 'New Projects' },
// //   'active': { dbValue: 'Active', title: 'Active Projects' },
// //   'on-hold': { dbValue: 'On Hold', title: 'On Hold Projects' },
// //   'completed': { dbValue: 'Completed', title: 'Completed Projects' },
// // };

// // export default function ProjectsByStatusPage({ params }: { params: { status: string } }) {
// //   const { user } = useAuth();
// //   const [loading, setLoading] = React.useState(true);
// //   const [projects, setProjects] = React.useState<Project[]>([]);

// //   const statusFilter = params.status || 'all';
// //   const statusConfig = statusMap[statusFilter];
// //   const pageTitle = statusConfig ? statusConfig.title : statusMap['all'].title;
// //   const dbStatus = statusConfig ? statusConfig.dbValue : 'all';

// //   React.useEffect(() => {
// //     if (user) {
// //       const fetchData = async () => {
// //         setLoading(true);
// //         const projectsData = await getProjectsByStatus(dbStatus, user);
// //         setProjects(projectsData);
// //         setLoading(false);
// //       };
// //       fetchData();
// //     }
// //   }, [user, dbStatus]);

// //   if (loading || !user) {
// //     return (
// //       <div className="flex h-full items-center justify-center">
// //         <Loader className="h-8 w-8 animate-spin" />
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex flex-col gap-6">
// //       <PageHeader
// //         title={pageTitle}
// //         description={user.role === 'Customer' ? 'A list of projects you are associated with.' : `Browse and manage all ${statusFilter.replace('-', ' ')} projects.`}
// //       >
// //         {(user.role === 'Admin' || user.role === 'Agent') && (
// //             <Link href="/projects/create" passHref>
// //             <Button>
// //                 <PlusCircle />
// //                 Create New Project
// //             </Button>
// //             </Link>
// //         )}
// //       </PageHeader>
// //       <ProjectClient projects={projects} />
// //     </div>
// //   );
// // }

// 'use client';

// import React from 'react';
// import { PageHeader } from "@/components/page-header";
// import { Button } from "@/components/ui/button";
// import { PlusCircle, Loader } from "lucide-react";
// import Link from "next/link";
// import { getProjectsByStatus } from "@/lib/firestore";
// import { ProjectClient } from "@/components/projects/project-client";
// import { useAuth } from '@/contexts/auth-context';
// import type { Project } from '@/lib/data';

// // TypeScript interfaces
// interface StatusConfig {
//   dbValue: string;
//   title: string;
// }

// interface PageParams {
//   status: string;
// }

// interface ProjectsByStatusPageProps {
//   params: Promise<PageParams>;
// }

// const statusMap: Record<string, StatusConfig> = {
//   'all': { dbValue: 'all', title: 'All Projects' },
//   'new': { dbValue: 'New', title: 'New Projects' },
//   'active': { dbValue: 'Active', title: 'Active Projects' },
//   'on-hold': { dbValue: 'On Hold', title: 'On Hold Projects' },
//   'completed': { dbValue: 'Completed', title: 'Completed Projects' },
// };

// export default async function ProjectsByStatusPage({ params }: ProjectsByStatusPageProps): Promise<JSX.Element> {
//   const { user } = useAuth();
//   const [loading, setLoading] = React.useState<boolean>(true);
//   const [projects, setProjects] = React.useState<Project[]>([]);

//   // Resolve the params Promise
//   const resolvedParams: PageParams = await params;
//   const statusFilter: string = resolvedParams.status || 'all';
//   const statusConfig: StatusConfig | undefined = statusMap[statusFilter];
//   const pageTitle: string = statusConfig ? statusConfig.title : statusMap['all'].title;
//   const dbStatus: string = statusConfig ? statusConfig.dbValue : 'all';

//   React.useEffect(() => {
//     if (user) {
//       const fetchData = async (): Promise<void> => {
//         setLoading(true);
//         const projectsData: Project[] = await getProjectsByStatus(dbStatus, user);
//         setProjects(projectsData);
//         setLoading(false);
//       };
//       fetchData();
//     }
//   }, [user, dbStatus]);

//   if (loading || !user) {
//     return (
//       <div className="flex h-full items-center justify-center">
//         <Loader className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-6">
//       <PageHeader
//         title={pageTitle}
//         description={user.role === 'Customer' ? 'A list of projects you are associated with.' : `Browse and manage all ${statusFilter.replace('-', ' ')} projects.`}
//       >
//         {(user.role === 'Admin' || user.role === 'Agent') && (
//             <Link href="/projects/create" passHref>
//             <Button>
//                 <PlusCircle />
//                 Create New Project
//             </Button>
//             </Link>
//         )}
//       </PageHeader>
//       <ProjectClient projects={projects} />
//     </div>
//   );
// }

'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader } from "lucide-react";
import Link from "next/link";
import { getProjectsByStatus } from "@/lib/firestore";
import { ProjectClient } from "@/components/projects/project-client";
import { useAuth } from '@/contexts/auth-context';
import type { Project } from '@/lib/data';

// TypeScript interfaces
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

export default function ProjectsByStatusPage({ params }: ProjectsByStatusPageProps): JSX.Element {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [projects, setProjects] = React.useState<Project[]>([]);
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
        const projectsData: Project[] = await getProjectsByStatus(dbStatus, user);
        setProjects(projectsData);
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
      <PageHeader
        title={pageTitle}
        description={user.role === 'Customer' ? 'A list of projects you are associated with.' : `Browse and manage all ${statusFilter.replace('-', ' ')} projects.`}
      >
        {(user.role === 'Admin' || user.role === 'Agent') && (
            <Link href="/projects/create" passHref>
            <Button>
                <PlusCircle />
                Create New Project
            </Button>
            </Link>
        )}
      </PageHeader>
      <ProjectClient projects={projects} />
    </div>
  );
}