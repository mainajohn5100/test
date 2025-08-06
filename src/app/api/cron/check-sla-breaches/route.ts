

import { NextResponse } from 'next/server';
import { getTicketsNearingSla, getUserByName, createNotification, getOrganizationById } from '@/lib/firestore';
import { sendEmail } from '@/lib/email';
import { differenceInMinutes } from 'date-fns';

export async function GET(request: Request) {
    // In a real production app, you would want to secure this endpoint.
    // For example, by checking a secret key in the headers or URL,
    // or by ensuring the request comes from a trusted IP (like Google Cloud Scheduler).
    // Example: const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log("CRON JOB: Checking for SLA breaches...");

    try {
        const atRiskTickets = await getTicketsNearingSla();
        const now = new Date();
        const notificationsCreated: string[] = [];
        
        for (const ticket of atRiskTickets) {
            // This check prevents sending duplicate notifications if the cron job runs frequently.
            // A more robust solution might involve storing the last notification timestamp on the ticket.
            const hasExistingSlaWarning = false; // Placeholder for more advanced logic
            if (hasExistingSlaWarning) continue;

            const assignee = await getUserByName(ticket.assignee);
            if (!assignee) continue;
            
            const org = await getOrganizationById(ticket.organizationId);
            if (!org?.settings?.emailTemplates) continue;

            const resolutionDueDate = new Date(ticket.resolutionDue!);
            const minutesToBreach = differenceInMinutes(resolutionDueDate, now);

            const isBreached = minutesToBreach <= 0;
            const notificationType = isBreached ? 'breached' : 'at_risk';
            
            let title: string;
            let description: string;
            let emailTemplate: string | undefined;

            if (isBreached) {
                title = `SLA Breached: ${ticket.title}`;
                description = `Resolution time for this ticket has been exceeded.`;
                emailTemplate = org.settings.emailTemplates.slaBreached;
            } else {
                title = `SLA Warning: ${ticket.title}`;
                description = `This ticket is due for resolution in ${minutesToBreach} minutes.`;
                emailTemplate = org.settings.emailTemplates.slaAtRisk;
            }

            // 1. Create In-App Notification
            await createNotification({
                userId: assignee.id,
                title,
                description,
                link: `/tickets/view/${ticket.id}`,
                type: 'sla_warning',
                metadata: { ticketId: ticket.id, status: notificationType }
            });

            // 2. Send Email Notification
            if (emailTemplate) {
                 await sendEmail({
                    to: assignee.email,
                    subject: title,
                    template: emailTemplate,
                    data: {
                        ticket,
                        user: assignee,
                    }
                });
            }
            
            notificationsCreated.push(ticket.id);
        }

        const message = `SLA Check Complete. Found ${atRiskTickets.length} tickets at risk or breached. Processed notifications for: ${notificationsCreated.join(', ') || 'None'}.`;
        console.log(message);
        return NextResponse.json({ success: true, message });

    } catch (error) {
        console.error('Error during SLA breach check cron job:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
