
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users } from "lucide-react";

export default function SuperAdminDashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Superadmin Dashboard"
                description="Oversee and manage all tenant organizations."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Organizations
                        </CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">
                            Loading...
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">
                            Across all organizations
                        </p>
                    </CardContent>
                </Card>
            </div>
             <div className="grid grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            A log of recent platform-wide events will be shown here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-10 text-muted-foreground">
                            Recent activity feed is coming soon.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
