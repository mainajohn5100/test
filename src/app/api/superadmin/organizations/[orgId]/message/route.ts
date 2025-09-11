
import { NextResponse } from 'next/server';
import { getPrimaryAdminForOrganization } from '@/lib/firestore';
import { sendEmail } from '@/lib/email';
import { verifySuperAdmin } from '@/lib/superadmin-auth';
import { z } from 'zod';

const messageSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  body: z.string().min(1, 'Body is required.'),
});

export async function POST(request: Request, { params }: { params: { orgId: string } }) {
    const { orgId } = params;

    try {
        const isSuperAdmin = await verifySuperAdmin(request.headers.get('Authorization'));
        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const validated = messageSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid request body', details: validated.error.flatten() }, { status: 400 });
        }

        const primaryAdmin = await getPrimaryAdminForOrganization(orgId);
        if (!primaryAdmin || !primaryAdmin.email) {
            return NextResponse.json({ error: 'Primary admin with a valid email not found for this organization.' }, { status: 404 });
        }

        // Using a generic template for now. A more advanced system would have a dedicated "superadmin-message" template.
        await sendEmail({
            to: primaryAdmin.email,
            subject: validated.data.subject,
            template: `Hi {{user.name}},\n\n{{{content}}}`,
            data: {
                user: { name: primaryAdmin.name },
                content: validated.data.body,
            },
            from: "superadmin@requestflow.app"
        });

        return NextResponse.json({ success: true, message: "Message sent." });

    } catch (error) {
        console.error(`Error sending message to organization ${orgId}:`, error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
