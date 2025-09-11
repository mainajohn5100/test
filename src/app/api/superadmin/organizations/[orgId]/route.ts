
import { NextResponse } from 'next/server';
import { 
    getOrganizationById, 
    updateOrganizationBySuperAdmin,
    getPrimaryAdminForOrganization,
    getUserCountForOrganization,
    getProjectCountForOrganization
} from '@/lib/firestore';
import { verifySuperAdmin } from '@/lib/superadmin-auth';
import { z } from 'zod';

const updateSchema = z.object({
  subscriptionPlan: z.string().optional(),
  subscriptionStatus: z.string().optional(),
  organizationStatus: z.enum(['active', 'suspended', 'disabled']).optional(),
});


export async function GET(request: Request, { params }: { params: { orgId: string } }) {
    const { orgId } = params;
    
    try {
        const isSuperAdmin = await verifySuperAdmin(request.headers.get('Authorization'));
        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const org = await getOrganizationById(orgId);
        if (!org) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }
        
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
            getProjectCountForOrganization(org.id),
        ]);

        const orgDetails = {
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

        return NextResponse.json(orgDetails);

    } catch (error) {
        console.error(`Error fetching organization ${orgId} for superadmin:`, error);
        return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
    }
}


export async function PUT(request: Request, { params }: { params: { orgId: string } }) {
    const { orgId } = params;

    try {
        const isSuperAdmin = await verifySuperAdmin(request.headers.get('Authorization'));
        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const validated = updateSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid request body', details: validated.error.flatten() }, { status: 400 });
        }

        const { subscriptionPlan, subscriptionStatus, organizationStatus } = validated.data;
        const updates: any = {};
        if (subscriptionPlan) updates['settings.subscriptionPlan'] = subscriptionPlan;
        if (subscriptionStatus) updates['settings.subscriptionStatus'] = subscriptionStatus;
        if (organizationStatus) updates['settings.organizationStatus'] = organizationStatus;

        if (Object.keys(updates).length > 0) {
            await updateOrganizationBySuperAdmin(orgId, updates);
        }

        return NextResponse.json({ success: true, message: "Organization updated." });

    } catch (error) {
        console.error(`Error updating organization ${orgId} for superadmin:`, error);
        return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
    }
}
