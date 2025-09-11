
import { NextResponse } from 'next/server';
import { 
    getAllOrganizations, 
    getPrimaryAdminForOrganization,
    getUserCountForOrganization,
    getProjectCountForOrganization
} from '@/lib/firestore';
import { verifySuperAdmin } from '@/lib/superadmin-auth';

export async function GET(request: Request) {
    try {
        // In a real app, you'd get the token from the Authorization header
        const isSuperAdmin = await verifySuperAdmin(request.headers.get('Authorization'));
        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const organizations = await getAllOrganizations();

        const organizationsWithDetails = await Promise.all(organizations.map(async (org) => {
            const [
                primaryAdmin, 
                adminCount, 
                agentCount, 
                clientCount, 
                projectCount
            ] = await Promise.all([
                getPrimaryAdminForOrganization(org.id),
                getUserCountForOrganization(org.id, 'Admin'),
                getUserCountForOrganization(org.id, 'Agent'),
                getUserCountForOrganization(org.id, 'Client'),
                getProjectCountForOrganization(org.id)
            ]);

            return {
                organizationId: org.id,
                organizationName: org.name,
                accountCreatedAt: org.createdAt,
                userCounts: {
                    admins: adminCount,
                    agents: agentCount,
                    clients: clientCount,
                },
                projectCount,
                subscriptionPlan: org.settings?.subscriptionPlan || 'Free',
                subscriptionStatus: org.settings?.subscriptionStatus || 'Active',
                configuredDomain: org.domain || org.subdomain,
                organizationLogoUrl: org.logo || '',
                supportInquiryEmail: org.settings?.supportEmail || primaryAdmin?.email || '',
            };
        }));
        
        return NextResponse.json(organizationsWithDetails);

    } catch (error) {
        console.error("Error fetching organizations for superadmin:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: "Failed to fetch organizations", details: errorMessage }, { status: 500 });
    }
}
