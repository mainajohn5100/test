
import { NextResponse } from 'next/server';
import { verifySuperAdmin } from '@/lib/superadmin-auth';
import { 
    getAllOrganizations,
    getUserCountForOrganization,
    getProjectCountForOrganization,
} from '@/lib/firestore';

export async function GET(request: Request) {
    try {
        const isSuperAdmin = await verifySuperAdmin(request.headers.get('Authorization'));
        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const organizations = await getAllOrganizations();
        let totalUsers = 0;
        let totalProjects = 0;

        for (const org of organizations) {
            const [adminCount, agentCount, clientCount, projectCount] = await Promise.all([
                getUserCountForOrganization(org.id, 'Admin'),
                getUserCountForOrganization(org.id, 'Agent'),
                getUserCountForOrganization(org.id, 'Client'),
                getProjectCountForOrganization(org.id),
            ]);
            totalUsers += adminCount + agentCount + clientCount;
            totalProjects += projectCount;
        }

        const activeSubscriptions = organizations.filter(org => org.settings?.subscriptionStatus === 'Active').length;

        // In a real implementation, this data would be fetched from various monitoring services,
        // databases, and logs. For now, we return a mix of real and placeholder data.
        const healthData = {
            applicationHealth: {
                uptime: "99.98%",
                errorRate: "0.02%",
                avgLatency: 120,
                p95Latency: 450,
                failedJobs: 3,
            },
            apiStatus: [
                { name: "Authentication", status: "Online" },
                { name: "Ticketing API", status: "Online" },
                { name: "Billing Service", status: "Online" },
                { name: "Email Service", status: "Degraded" },
                { name: "Background Jobs", status: "Online" },
            ],
            databaseHealth: {
                avgQueryTime: 8,
                connections: "45 / 100",
                readWriteRatio: "80 / 20",
                storageUsage: "65.2 GB",
                slowQueries: 3,
            },
            infrastructure: {
                avgCpuUsage: "35%",
                memoryUsage: "7.8 / 16 GB",
                networkIO: "1.2 Gbps",
                cacheHitRatio: "98.2%",
                serverStatus: "Online",
            },
            tenantMetrics: {
                activeTenants: activeSubscriptions,
                inactiveTenants: organizations.length - activeSubscriptions,
                slaCompliance: "99.2%",
                avgTicketBacklog: 12,
                highLoadTenants: 3,
                topTenantByErrors: "Innovate Inc.",
            },
            security: {
                failedLogins: 1289,
                rateLimitsTriggered: 45,
                invalidApiKeys: 12,
                replicationLag: "2s",
                auditLogStatus: "Online",
            },
             visualizations: {
                slaCompliance: 99.2,
            }
        };

        return NextResponse.json(healthData);

    } catch (error) {
        console.error("Error fetching system health data for superadmin:", error);
        return NextResponse.json({ error: "Failed to fetch system health data" }, { status: 500 });
    }
}
