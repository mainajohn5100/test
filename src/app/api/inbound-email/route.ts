
import { NextResponse } from 'next/server';
import { addTicket, getUserByEmail } from '@/lib/firestore';
import { analyzeEmailForSource } from '@/ai/flows/analyze-email-for-source';
import { analyzeEmailPriority } from '@/ai/flows/analyze-email-priority';
import { suggestTags } from '@/ai/flows/suggest-tags';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || '',
});

// A more realistic model of the Mailgun webhook payload for parsed emails.
// See: https://documentation.mailgun.com/en/latest/user_manual.html#routes
interface MailgunWebhookPayload {
    sender: string; // "bob@example.com"
    from: string; // "Bob <bob@example.com>"
    recipient: string; // The unique forwarding address, "inbound-alias@inbound.requestflow.app"
    subject: string;
    'body-plain': string; // Plain text body of the email
    signature: {
        timestamp: string;
        token: string;
        signature: string;
    }
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
    const payload = await request.json() as MailgunWebhookPayload;

    // Verify the webhook signature to ensure it's from Mailgun
    const signingKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY;
    if (!signingKey) {
        console.error("MAILGUN_WEBHOOK_SIGNING_KEY is not set in environment variables.");
        return NextResponse.json({ error: 'Webhook signing key is not configured.' }, { status: 500 });
    }

    const isAuthentic = await mg.webhooks.verifyWebhookSignature({
      signature: payload.signature.signature,
      timestamp: payload.signature.timestamp,
      token: payload.signature.token,
    });
    
    if (!isAuthentic) {
        return NextResponse.json({ error: 'Unauthentic webhook signature' }, { status: 401 });
    }

    const { name: reporterName, email: reporterEmail } = parseFromAddress(payload.from);
    
    // 1. Check if the email should be ignored (e.g., system notification)
    const priorityAnalysis = await analyzeEmailPriority({
      fromAddress: reporterEmail,
      subject: payload.subject,
      body: payload['body-plain'],
    });

    if (priorityAnalysis.isSystemNotification) {
      console.log(`Ignoring system notification from ${reporterEmail}.`);
      return NextResponse.json({ message: 'System notification ignored.' });
    }
    
    // 2. Determine the source and find the organization to associate with
    const sourceAnalysis = await analyzeEmailForSource({
        fromAddress: reporterEmail,
        subject: payload.subject,
        body: payload['body-plain'],
    });

    // Find the user who submitted the ticket to get their organizationId
    const reporterUser = await getUserByEmail(reporterEmail);
    if (!reporterUser) {
        console.warn(`Webhook received for an unknown user: ${reporterEmail}. Ticket will not be created.`);
        // Respond with a 200 OK to Mailgun so it doesn't retry, but log the issue.
        return NextResponse.json({ message: `User with email ${reporterEmail} not found.` });
    }

    // 3. Suggest tags based on content
    const tagSuggestions = await suggestTags({ ticketContent: payload['body-plain'] });

    // 4. Create the ticket
    const ticketData = {
      title: payload.subject,
      description: payload['body-plain'],
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
