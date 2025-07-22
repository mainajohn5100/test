
import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationByWhatsAppNumber, getUserByPhone, addTicket, createUserInFirestore, getOpenTicketsByUserId, addConversation } from '@/lib/firestore';
import { Twilio } from 'twilio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    
    const from = body.get('From') as string; // e.g., whatsapp:+14155238886
    const to = body.get('To') as string;     // e.g., whatsapp:+1234567890
    const messageBody = body.get('Body') as string;
    const profileName = body.get('ProfileName') as string;
    const accountSid = body.get('AccountSid') as string;

    if (!from || !messageBody || !to) {
        return NextResponse.json({ error: 'Missing required fields from webhook.' }, { status: 400 });
    }

    const clientPhoneNumber = from.replace('whatsapp:', '');
    const businessPhoneNumber = to.replace('whatsapp:', '');

    // 1. Find the organization by the business phone number
    const organization = await getOrganizationByWhatsAppNumber(businessPhoneNumber);
    if (!organization) {
        console.warn(`Webhook received for an unconfigured WhatsApp number: ${businessPhoneNumber}`);
        return NextResponse.json({ error: `WhatsApp number ${businessPhoneNumber} is not configured for any organization.` }, { status: 404 });
    }

    // 2. Validate the request is from the correct Twilio account
    if (organization.settings?.whatsapp?.accountSid !== accountSid) {
        console.error(`Request SID ${accountSid} does not match configured SID ${organization.settings.whatsapp.accountSid}`);
        return NextResponse.json({ error: 'Invalid AccountSid. Request ignored.' }, { status: 403 });
    }

    // 3. Find or create the user by their phone number
    let user = await getUserByPhone(clientPhoneNumber, organization.id);

    if (!user) {
        // Create a new user if they don't exist
        const initials = profileName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const avatar = `https://placehold.co/32x32/A2E9C1/4A4A4A.png?text=${initials}`;
        
        const newUserData = {
            name: profileName,
            email: '', // No email from WhatsApp
            phone: clientPhoneNumber,
            role: 'Client' as const,
            avatar,
            organizationId: organization.id,
            status: 'active' as const,
            activityIsPublic: false,
            createdByAdmin: false,
        };
        // This is a simplified user creation. A real app might require more fields or logic.
        // We'll use the phone number to create a unique ID for whatsapp users
        const newUserId = `whatsapp_${clientPhoneNumber}`;
        await createUserInFirestore(newUserId, newUserData);
        user = { ...newUserData, id: newUserId };
    }
    
    // 4. Check for existing open tickets for this user
    const openTickets = await getOpenTicketsByUserId(user.id, organization.id);

    if (openTickets.length > 0) {
        // Append to the most recently updated open ticket
        const ticketToUpdate = openTickets[0]; // getOpenTicketsByUserId returns sorted by updatedAt desc
        await addConversation(ticketToUpdate.id, { content: messageBody, authorId: user.id });
        console.log(`Appended reply from ${profileName} to existing ticket ${ticketToUpdate.id}`);
        return NextResponse.json({ success: true, message: `Appended reply to ticket ${ticketToUpdate.id}` });
    } else {
        // 5. Create a new ticket if no open tickets exist
        const ticketData = {
            title: `New WhatsApp Ticket from ${profileName}`,
            description: messageBody,
            reporter: user.name,
            reporterEmail: user.email, // Will be empty
            tags: ['whatsapp'],
            priority: 'Medium' as const,
            category: 'General' as const,
            assignee: 'Unassigned',
            project: null,
            source: 'WhatsApp' as const,
            organizationId: organization.id,
            statusLastSetBy: 'System' as const,
            priorityLastSetBy: 'System' as const,
        };
        
        const newTicketId = await addTicket(ticketData);

        // 6. Send confirmation reply via Twilio ONLY for new tickets
        const twilioClient = new Twilio(organization.settings.whatsapp.accountSid, organization.settings.whatsapp.authToken);
        
        await twilioClient.messages.create({
            from: to,
            to: from,
            body: `Thanks for contacting us, ${profileName}! We've received your message and created ticket #${newTicketId.substring(0, 6)}. An agent will be with you shortly.`
        });

        return NextResponse.json({ success: true, ticketId: newTicketId });
    }

  } catch (error) {
    console.error('Error processing Twilio inbound WhatsApp message:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process message.', details: errorMessage }, { status: 500 });
  }
}
