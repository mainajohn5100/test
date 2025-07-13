
      
import { NextResponse } from 'next/server';
import { addTicket, getUserByName, getUserByEmail } from '@/lib/firestore';
import { analyzeEmailForSource } from '@/ai/flows/analyze-email-for-source';
import { analyzeEmailPriority } from '@/ai/flows/analyze-email-priority';
import { suggestTags } from '@/ai/flows/suggest-tags';
import type { Ticket } from '@/lib/data';

// This is a simplified model of what an email service webhook might send.
// In a real-world scenario, this would be more complex and might include
// HTML body, headers, and attachment data.
interface InboundEmailPayload {
    from: string; // "John Doe <john.doe@example.com>"
    to: string; // The unique forwarding address like "inbound-alias@inbound.requestflow.app"
    subject: string;
    text: string; // Plain text body of the email
}

// Helper to parse "Name <email@example.com>" into name and email
function parseFromAddress(from: string): { name: string, email: string } {
    const match = from.match(/(.*)<(.*)>/);
    if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
    }
    return { name: from, email: from };
}


export async function POST(request: Request) {
  try {
    // In a production app, you would add a secret key or signature verification
    // to ensure this endpoint is only called by your trusted email service.
    // For example:
    // const secret = request.headers.get('x-webhook-secret');
    // if (secret !== process.env.EMAIL_WEBHOOK_SECRET) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const payload: InboundEmailPayload = await request.json();

    const { name: reporterName, email: reporterEmail } = parseFromAddress(payload.from);
    
    // 1. Check if the email should be ignored (e.g., system notification)
    const priorityAnalysis = await analyzeEmailPriority({
      fromAddress: reporterEmail,
      subject: payload.subject,
      body: payload.text,
    });

    if (priorityAnalysis.isSystemNotification) {
      console.log(`Ignoring system notification from ${reporterEmail}.`);
      return NextResponse.json({ message: 'System notification ignored.' });
    }
    
    // 2. Determine the source and find the organization to associate with
    const sourceAnalysis = await analyzeEmailForSource({
        fromAddress: reporterEmail,
        subject: payload.subject,
        body: payload.text,
    });

    // Find the user who submitted the ticket to get their organizationId
    // In a real multi-tenant app, we might look up the org based on the 'to' address.
    const reporterUser = await getUserByEmail(reporterEmail);
    if (!reporterUser) {
        return NextResponse.json({ error: `User with email ${reporterEmail} not found.` }, { status: 404 });
    }

    // 3. Suggest tags based on content
    const tagSuggestions = await suggestTags({ ticketContent: payload.text });

    // 4. Create the ticket
    const ticketData = {
      title: payload.subject,
      description: payload.text,
      reporter: reporterName,
      reporterEmail: reporterEmail,
      tags: tagSuggestions.tags || [],
      priority: priorityAnalysis.priority,
      assignee: 'Unassigned',
      project: null,
      source: sourceAnalysis.source,
      organizationId: reporterUser.organizationId,
    };

    const newTicketId = await addTicket(ticketData);

    console.log(`Successfully created ticket ${newTicketId} from email.`);
    
    return NextResponse.json({ success: true, ticketId: newTicketId });

  } catch (error) {
    console.error('Error processing inbound email:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process inbound email.', details: errorMessage }, { status: 500 });
  }
}

    