
import { NextResponse } from 'next/server';
import { getUsersForOrganization } from '@/lib/firestore';
import { verifySuperAdmin } from '@/lib/superadmin-auth';

export async function GET(request: Request, { params }: { params: { orgId: string } }) {
    const { orgId } = params;
    
    try {
        const isSuperAdmin = await verifySuperAdmin(request.headers.get('Authorization'));
        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const users = await getUsersForOrganization(orgId);
        
        const userList = users.map(user => ({
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            lastSeen: user.lastSeen || 'Never',
        }));

        return NextResponse.json(userList);

    } catch (error) {
        console.error(`Error fetching users for organization ${orgId}:`, error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
