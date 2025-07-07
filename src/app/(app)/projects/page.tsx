import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { projects } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Projects"
        description="Manage all your projects in one place."
      />
      <Card>
        <CardHeader>
            <CardTitle>All Projects</CardTitle>
            <CardDescription>A list of all projects, both active and inactive.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead>Deadline</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>
                                <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>{project.status}</Badge>
                            </TableCell>
                            <TableCell>{project.manager}</TableCell>
                            <TableCell>{new Date(project.deadline).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
