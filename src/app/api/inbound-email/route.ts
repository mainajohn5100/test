
import { NextResponse } from 'next/server';
import { addTicket, getUserByEmail } from '@/lib/firestore';
import { analyzeEmailForSource } from '@/ai/flows/analyze-email-for-source';
import { analyzeEmailPriority } from '@/ai/flows/analyze-email-priority';
import { suggestTags } from '@/ai/flows/suggest-tags';
import { verifier } from '@sendgrid/eventwebhook';

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
    const signingKey = process.env.SENDGRID_WEBHOOK_SIGNING_KEY;
    if (!signingKey) {
        console.error("SENDGRID_WEBHOOK_SIGNING_KEY is not set in environment variables.");
        return NextResponse.json({ error: 'Webhook signing key is not configured.' }, { status: 500 });
    }

    const signature = request.headers.get('x-twilio-email-event-webhook-signature');
    const timestamp = request.headers.get('x-twilio-email-event-webhook-timestamp');
    const body = await request.text();

    if (!signature || !timestamp) {
        return NextResponse.json({ error: 'Missing SendGrid signature headers.' }, { status: 400 });
    }
    
    // Verify the webhook signature to ensure it's from SendGrid
    const isValid = verifier.verifyEvent(body, signature, timestamp, signingKey);
    if (!isValid) {
        console.warn("Received a request with an invalid SendGrid signature.");
        return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
    }
    
    // SendGrid sends the payload as multipart/form-data, so we need to parse it.
    // Since we already consumed the body as text for verification, we re-create a request to parse form data.
    const formData = new URLSearchParams(body);
    const from = formData.get('from') || '';
    const subject = formData.get('subject') || 'No Subject';
    const textBody = formData.get('text') || '';

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

    // 3. Suggest tags based on content
    const tagSuggestions = await suggestTags({ ticketContent: textBody });

    // 4. Create the ticket
    const ticketData = {
      title: subject,
      description: textBody.replace(/\n/g, '<br>'), // Basic HTML conversion for display
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

    console.log(`Successfully created ticket ${newTicketId} from email sent by ${reporterEmail}.`);
    
    // SendGrid requires a 200 OK response to stop retrying.
    return NextResponse.json({ success: true, ticketId: newTicketId });

  } catch (error) {
    console.error('Error processing SendGrid inbound email:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process inbound email.', details: errorMessage }, { status: 500 });
  }
}
