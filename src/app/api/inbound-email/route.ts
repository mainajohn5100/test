
import { NextResponse } from 'next/server';
import { addTicket, getOrganizationById, getUserByEmail } from '@/lib/firestore';
import { analyzeEmailForSource } from '@/ai/flows/analyze-email-for-source';
import { analyzeEmailPriority } from '@/ai/flows/analyze-email-priority';
import { suggestTags } from '@/ai/flows/suggest-tags';
import { sendEmail } from '@/lib/email';
import type { Ticket, SLAPolicy } from '@/lib/data';
import type { NextApiRequest } from 'next';
import { Resend } from 'resend';
import { addHours } from 'date-fns';

// Helper to parse "Name <email@example.com>" into name and email
function parseFromAddress(from: string): { name: string, email: string } {
    const match = from.match(/(.*)<(.*)>/);
    if (match) {
        return { name: match[1].trim() || match[2].trim(), email: match[2].trim() };
    }
    return { name: from, email: from };
}

export async function POST(request: Request) {
  try {
    // Resend doesn't use signing keys by default, but you could implement your own
    // shared secret in the webhook URL if needed.
    // E.g., /api/inbound-email?secret=YOUR_SECRET_HERE
    // For now, we trust the incoming request is from Resend.
    
    // Resend sends the payload as JSON
    const payload = await request.json();

    const from = payload.from || '';
    const subject = payload.subject || 'No Subject';
    const textBody = payload.text || '';
    const htmlBody = payload.html || textBody.replace(/\n/g, '<br>');

    const { name: reporterName, email: reporterEmail } = parseFromAddress(from);
    
    // 1. Check if the email should be ignored (e.g., system notification)
    const priorityAnalysis = await analyzeEmailPriority({
      fromAddress: reporterEmail,
      subject: subject,
      body: textBody,
    });

    if (priorityAnalysis.isSystemNotification) {
      console.log(`Ignoring system notification from ${reporterEmail}.`);
      return NextResponse.json({ message: 'System notification ignored.' });
    }
    
    // 2. Determine the source and find the organization to associate with
    const sourceAnalysis = await analyzeEmailForSource({
        fromAddress: reporterEmail,
        subject: subject,
        body: textBody,
    });

    const reporterUser = await getUserByEmail(reporterEmail);
    if (!reporterUser) {
        console.warn(`Webhook received for an unknown user: ${reporterEmail}. Ticket will not be created.`);
        return NextResponse.json({ message: `User with email ${reporterEmail} not found.` });
    }
    
    const org = await getOrganizationById(reporterUser.organizationId);

    // 3. Suggest tags based on content
    const tagSuggestions = await suggestTags({ ticketContent: textBody });

    // 4. Create the ticket
    const ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'> = {
      title: subject,
      description: htmlBody,
      reporter: reporterName,
      reporterEmail: reporterEmail,
      tags: tagSuggestions.tags || [],
      priority: priorityAnalysis.priority,
      assignee: 'Unassigned',
      project: null,
      source: sourceAnalysis.source,
      organizationId: reporterUser.organizationId,
      statusLastSetBy: 'System',
      priorityLastSetBy: 'System',
    };
    
    const slaPolicy = org?.settings?.slaPolicies?.[0];
    if (slaPolicy) {
      const target = slaPolicy.targets.find(t => t.priority === ticketData.priority);
      if (target) {
        const now = new Date();
        ticketData.slaPolicyId = slaPolicy.id;
        ticketData.firstResponseDue = addHours(now, target.firstResponseHours).toISOString();
        ticketData.resolutionDue = addHours(now, target.resolutionHours).toISOString();
      }
    }


    const newTicketId = await addTicket(ticketData);

    // 5. Send auto-reply confirmation email
    if (org?.settings?.emailTemplates?.newTicketAutoReply) {
      await sendEmail({
        to: reporterEmail,
        subject: `Re: ${subject}`,
        template: org.settings.emailTemplates.newTicketAutoReply,
        data: {
          ticket: { ...ticketData, id: newTicketId },
          user: reporterUser
        }
      });
    }

    console.log(`Successfully created ticket ${newTicketId} from email sent by ${reporterEmail}.`);
    
    // Resend requires a 200 OK response to stop retrying.
    return NextResponse.json({ success: true, ticketId: newTicketId });

  } catch (error) {
    console.error('Error processing Resend inbound email:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process inbound email.', details: errorMessage }, { status: 500 });
  }
}
