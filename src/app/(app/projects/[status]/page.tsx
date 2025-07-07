
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getProjects, getProjectsByStatus } from "@/lib/firestore";
import { ArrowRight, ListFilter, PlusCircle, Search } from "lucide-react";
import { format } from 'date-fns';
import Link from "next/link";

const projectStatusVariantMap: { [key: string]: string } = {
  'Active': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  'Completed': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  'New': 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
};

export default async function ProjectsByStatusPage({ params }: { params: { status: string } }) {
    const statusFilter = params.status || 'all';

    let pageTitle = "All Projects";
    let pageDescription = "Browse and manage all your projects.";
    let normalizedStatus = 'all';

    if (statusFilter && statusFilter !== 'all') {
        normalizedStatus = statusFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        pageTitle = `${normalizedStatus} Projects`;
        pageDescription = `Browse and manage all ${statusFilter.replace('-', ' ')} projects.`
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
        description={pageDescription}
      >
        <Button>
            <PlusCircle />
            Create New Project
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select defaultValue="newest">
              <SelectTrigger className="w-full sm:w-[180px]">
                  <ListFilter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="deadline">By Deadline</SelectItem>
              </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length > 0 ? projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-headline">{project.name}</CardTitle>
                  <Badge className={projectStatusVariantMap[project.status] || 'bg-gray-100'}>{project.status}</Badge>
              </div>
              <CardDescription>
                Created: {format(new Date(project.createdAt), 'PP')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">A brief summary of the project goals and objectives. This provides a quick overview for anyone looking at the project list.</p>
              <div className="space-y-1">
                <p className="text-sm font-medium">Project Manager</p>
                <p className="text-sm text-muted-foreground">{project.manager}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Deadline</p>
                <p className="text-sm text-muted-foreground">{format(new Date(project.deadline), 'PP')}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/projects/view/${project.id}`} passHref className="w-full">
                <Button variant="outline" className="w-full">
                  View Project
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )) : (
            <div className="md:col-span-2 lg:col-span-3 text-center py-10 text-muted-foreground">
                <p>No projects found for this status.</p>
            </div>
        )}
      </div>
    </div>
  );
}
