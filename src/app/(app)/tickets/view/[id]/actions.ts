
'use server';

import { revalidatePath } from 'next/cache';
import { createNotification, getTicketById, updateTicket, deleteTicket, getUserById, addConversation, getUserByName } from '@/lib/firestore';
import type { Ticket, User, TicketConversation } from '@/lib/data';
import { redirect } from 'next/navigation';

// For this prototype, we'll simulate sending an email by logging to the console.
// In a real application, you would integrate a service like SendGrid, Mailgun, etc.
async function sendEmailNotification(to: string, subject: string, body: string) {
    console.log("--- SIMULATING EMAIL ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log("-----------------------");
    return Promise.resolve();
}

// Helper to determine notification details based on what changed
async function getNotificationDetails(
  ticket: Ticket, 
  updates: Partial<Omit<Ticket, 'id'>>,
  oldAssigneeId: string | null,
  newAssignee?: User | null
) {
    const changes = [];
    let emailDetails: { to: string; subject: string; body: string; } | null = null;
    let notificationDetails: { userId: string; title: string; description: string; } | null = null;
    
    const reporterUser = await getUserByName(ticket.reporter);
    const newAssigneeUser = newAssignee;
    
    // Case 1: Ticket is reassigned
    if (newAssigneeUser && newAssigneeUser.id !== oldAssigneeId) {
        notificationDetails = {
            userId: newAssigneeUser.id,
            title: `You have been assigned ticket: "${ticket.title}"`,
            description: `You are the new assignee for ticket #${ticket.id.substring(0,6)}.`
        };
        emailDetails = {
            to: newAssigneeUser.email,
            subject: `[Ticket #${ticket.id.substring(0,6)}] You've been assigned: ${ticket.title}`,
            body: `Hi ${newAssigneeUser.name},\n\nYou have been assigned a new ticket: "${ticket.title}".\n\nYou can view the ticket details here: /tickets/view/${ticket.id}\n\nThank you.`
        };
    } 
    // Case 2: Ticket status changes
    else if (updates.status && updates.status !== ticket.status) {
        changes.push(`status updated to ${updates.status}`);
        
        if (reporterUser && reporterUser.email) {
             emailDetails = {
                to: reporterUser.email,
                subject: `[Ticket #${ticket.id.substring(0,6)}] Status of your ticket has been updated: ${ticket.title}`,
                body: `Hi ${reporterUser.name},\n\nThe status of your ticket "${ticket.title}" has been updated to "${updates.status}".\n\nYou can view the ticket details here: /tickets/view/${ticket.id}\n\nThank you.`
            };
        }
        
        if (ticket.assignee !== 'Unassigned' && oldAssigneeId) {
             notificationDetails = {
                userId: oldAssigneeId,
                title: `Ticket Updated: "${ticket.title}"`,
                description: `The status was changed to ${updates.status}.`
            };
        }
    }
    // Case 3: Other updates
    else {
        if (updates.priority) changes.push(`priority set to ${updates.priority}`);
        if (updates.tags) changes.push(`tags were updated`);
        
        if (changes.length > 0 && ticket.assignee !== 'Unassigned' && oldAssigneeId) {
            notificationDetails = {
                userId: oldAssigneeId,
                title: `Ticket Updated: "${ticket.title}"`,
                description: `The following was changed: ${changes.join(', ')}.`
            };
        }
    }

    return { notificationDetails, emailDetails };
}

export async function addReplyAction(data: { ticketId: string; content: string; authorId: string; }) {
  try {
    const { ticketId, content, authorId } = data;
    await addConversation(ticketId, { content, authorId });

    // After adding reply, send notifications
    const ticket = await getTicketById(ticketId);
    const author = await getUserById(authorId);
    if (!ticket || !author) {
      throw new Error("Ticket or author not found");
    }

    const isClientReply = author.role === 'Client';
    
    // Notify the assignee if a client replied
    if (isClientReply && ticket.assignee !== 'Unassigned') {
      const assigneeUser = await getUserByName(ticket.assignee);
      if (assigneeUser) {
        await createNotification({
            userId: assigneeUser.id,
            title: `New reply on ticket: "${ticket.title}"`,
            description: `${author.name} has replied to ticket #${ticket.id.substring(0,6)}.`,
            link: `/tickets/view/${ticketId}`,
        });
        await sendEmailNotification(
            assigneeUser.email,
            `[Ticket #${ticket.id.substring(0,6)}] New reply from client: ${ticket.title}`,
            `Hi ${assigneeUser.name},\n\nA new reply has been added to ticket "${ticket.title}" by ${author.name}.\n\nReply: ${content.replace(/<[^>]*>?/gm, '')}\n\nYou can view the ticket here: /tickets/view/${ticketId}`
        );
      }
    }

    // Notify the client if an agent replied
    if (!isClientReply) {
        const reporterUser = await getUserByName(ticket.reporter);
        if (reporterUser && reporterUser.email) {
             await sendEmailNotification(
                reporterUser.email,
                `[Ticket #${ticket.id.substring(0,6)}] An agent has replied to your ticket: ${ticket.title}`,
                `Hi ${reporterUser.name},\n\n${author.name} has replied to your ticket "${ticket.title}".\n\nReply: ${content.replace(/<[^>]*>?/gm, '')}\n\nYou can view the ticket here: /tickets/view/${ticketId}`
            );
        }
    }

    revalidatePath(`/tickets/view/${ticketId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in addReplyAction:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add reply.';
    return { success: false, error: errorMessage };
  }
}

export async function updateTicketAction(
  ticketId: string,
  updates: Partial<Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>>,
  assigneeDetails?: { oldAssigneeId: string | null, newAssignee?: User | null }
) {
  try {
    const currentTicket = await getTicketById(ticketId);
    if (!currentTicket) {
      throw new Error("Ticket not found for update.");
    }

    await updateTicket(ticketId, updates);
    const updatedTicket = { ...currentTicket, ...updates };

    const { notificationDetails, emailDetails } = await getNotificationDetails(
        updatedTicket, 
        updates, 
        assigneeDetails?.oldAssigneeId ?? null,
        assigneeDetails?.newAssignee
    );

    if (notificationDetails) {
        await createNotification({
            userId: notificationDetails.userId,
            title: notificationDetails.title,
            description: notificationDetails.description,
            link: `/tickets/view/${ticketId}`,
        });
    }

    if (emailDetails) {
        await sendEmailNotification(emailDetails.to, emailDetails.subject, emailDetails.body);
    }

    revalidatePath(`/tickets/view/${ticketId}`);
    revalidatePath('/tickets', 'layout');
    revalidatePath('/dashboard');

    return { success: true, message: 'Ticket updated successfully.' };
  } catch (error) {
    console.error("Error in updateTicketAction:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update ticket.';
    return { success: false, error: errorMessage };
  }
}

export async function deleteTicketAction(ticketId: string) {
  try {
    await deleteTicket(ticketId);
    revalidatePath('/tickets', 'layout');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error("Error in deleteTicketAction:", error);
    return {
      error: 'Failed to delete ticket. Please try again.',
    };
  }
  redirect('/tickets/all');
}
