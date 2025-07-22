
'use client';

import React, { useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { getOrganizationById, updateOrganizationSettings } from '@/lib/firestore';
import type { EmailTemplate } from '@/lib/data';
import { Loader } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const defaultTemplates: EmailTemplate = {
  newTicketAutoReply: `Hi {{user.name}},\n\nWe have received your request ({{ticket.id}}) and are working on it.\n\nTicket Title: {{ticket.title}}\n\nThank you,\nYour Support Team`,
  statusChange: `Hi {{user.name}},\n\nThe status of your ticket "{{ticket.title}}" has been updated to: {{ticket.status}}.\n\nThank you,\nYour Support Team`,
  priorityChange: `Hi {{user.name}},\n\nThe priority of your ticket "{{ticket.title}}" has been updated to: {{ticket.priority}}.\n\nThank you,\nYour Support Team`,
  newAssignee: `Hi {{user.name}},\n\nYou have been assigned a new ticket: "{{ticket.title}}".\n\n- The Support Team`,
  projectInvite: `Hi {{user.name}},\n\nYou've been invited by {{inviter.name}} to join the project: "{{project.name}}".\n\nPlease sign up or log in to access the project: {{link}}\n\nThank you,\nThe Support Team`,
  agentReplyToClient: `Hi {{user.name}},\n\nThere's a new reply on your ticket: "{{ticket.title}}".\n\n{{replier.name}} said:\n{{content}}\n\nPlease visit the ticket page to respond.\n- The Support Team`,
  clientReplyToAgent: `Hi {{user.name}},\n\nThere's a new reply from a client on ticket: "{{ticket.title}}".\n\n{{replier.name}} said:\n{{content}}\n\nPlease visit the ticket page to respond.\n- The Support Team`,
  adminReplyToClient: `Hi {{user.name}},\n\nAn administrator has replied to your ticket: "{{ticket.title}}".\n\n{{replier.name}} said:\n{{content}}\n\nPlease visit the ticket page to respond.\n- The Support Team`,
  adminReplyToAgent: `Hi {{user.name}},\n\nAn administrator has replied to a ticket you are assigned to: "{{ticket.title}}".\n\n{{replier.name}} said:\n{{content}}\n\nPlease visit the ticket page to respond.\n- The Support Team`,
  clientReplyToAdmin: `Hi {{user.name}},\n\nA client has replied to a ticket you are involved in: "{{ticket.title}}".\n\n{{replier.name}} said:\n{{content}}\n\nPlease visit the ticket page to respond.\n- The Support Team`,
  agentReplyToAdmin: `Hi {{user.name}},\n\nAn agent has replied to a ticket you are involved in: "{{ticket.title}}".\n\n{{replier.name}} said:\n{{content}}\n\nPlease visit the ticket page to respond.\n- The Support Team`,
};

export function EmailTemplatesForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<Partial<EmailTemplate>>({
    defaultValues: {},
  });

  useEffect(() => {
    if (user?.organizationId) {
      getOrganizationById(user.organizationId).then(org => {
        const currentTemplates = org?.settings?.emailTemplates || {};
        reset({
          newTicketAutoReply: currentTemplates.newTicketAutoReply || defaultTemplates.newTicketAutoReply,
          statusChange: currentTemplates.statusChange || defaultTemplates.statusChange,
          priorityChange: currentTemplates.priorityChange || defaultTemplates.priorityChange,
          newAssignee: currentTemplates.newAssignee || defaultTemplates.newAssignee,
          projectInvite: currentTemplates.projectInvite || defaultTemplates.projectInvite,
          agentReplyToClient: currentTemplates.agentReplyToClient || defaultTemplates.agentReplyToClient,
          clientReplyToAgent: currentTemplates.clientReplyToAgent || defaultTemplates.clientReplyToAgent,
          adminReplyToClient: currentTemplates.adminReplyToClient || defaultTemplates.adminReplyToClient,
          adminReplyToAgent: currentTemplates.adminReplyToAgent || defaultTemplates.adminReplyToAgent,
          clientReplyToAdmin: currentTemplates.clientReplyToAdmin || defaultTemplates.clientReplyToAdmin,
          agentReplyToAdmin: currentTemplates.agentReplyToAdmin || defaultTemplates.agentReplyToAdmin,
        });
      });
    }
  }, [user, reset]);

  const onSubmit = (data: Partial<EmailTemplate>) => {
    if (!user) return;
    startTransition(async () => {
      try {
        await updateOrganizationSettings(user.organizationId, { emailTemplates: data });
        toast({ title: 'Success', description: 'Email templates have been saved.' });
        reset(data); // Resets the dirty state
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to save email templates.', variant: 'destructive' });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Templates</CardTitle>
        <CardDescription>
          Customize the content of automated emails. Use placeholders like 'ticket.title' or 'user.name' enclosed with double curly braces to personalize the email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="hover:no-underline font-semibold">General Notifications</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <h4 className="font-medium text-sm mb-1">New Ticket Auto-Reply</h4>
                  <p className="text-sm text-muted-foreground pb-2">Sent to a client when a new ticket is created via email.</p>
                  <Controller
                    name="newTicketAutoReply"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} rows={6} className="font-mono text-xs"/>
                    )}
                  />
                </div>
                 <div>
                  <h4 className="font-medium text-sm mb-1">Status Change Notification</h4>
                  <p className="text-sm text-muted-foreground pb-2">Sent to a client when their ticket's status is updated.</p>
                  <Controller
                    name="statusChange"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} rows={6} className="font-mono text-xs"/>
                    )}
                  />
                </div>
                 <div>
                  <h4 className="font-medium text-sm mb-1">Priority Change Notification</h4>
                  <p className="text-sm text-muted-foreground pb-2">Sent to a client when their ticket's priority is updated.</p>
                  <Controller
                    name="priorityChange"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} rows={6} className="font-mono text-xs"/>
                    )}
                  />
                </div>
                 <div>
                  <h4 className="font-medium text-sm mb-1">New Assignee Notification</h4>
                  <p className="text-sm text-muted-foreground pb-2">Sent to an agent when they are assigned a new ticket.</p>
                  <Controller
                    name="newAssignee"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} rows={6} className="font-mono text-xs"/>
                    )}
                  />
                </div>
                 <div>
                  <h4 className="font-medium text-sm mb-1">Project Invitation</h4>
                  <p className="text-sm text-muted-foreground pb-2">Sent to a user when they are invited to a project.</p>
                  <Controller
                    name="projectInvite"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} rows={6} className="font-mono text-xs"/>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="hover:no-underline font-semibold">Standard Conversation Replies</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                 <div>
                  <h4 className="font-medium text-sm mb-1">Agent's Reply to Client</h4>
                  <p className="text-sm text-muted-foreground pb-2">Sent to a client when an agent replies to their ticket.</p>
                  <Controller
                    name="agentReplyToClient"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} rows={6} className="font-mono text-xs"/>
                    )}
                  />
                </div>
                 <div>
                  <h4 className="font-medium text-sm mb-1">Client's Reply to Agent</h4>
                  <p className="text-sm text-muted-foreground pb-2">Sent to an agent when a client replies to a ticket.</p>
                  <Controller
                    name="clientReplyToAgent"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} rows={6} className="font-mono text-xs"/>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
              <AccordionTrigger className="hover:no-underline font-semibold">Administrator Conversation Replies</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                 <div>
                  <h4 className="font-medium text-sm mb-1">Admin's Reply to Client</h4>
                  <p className="text-sm text-muted-foreground pb-2">Sent to a client when an admin replies to their ticket.</p>
                  <Controller
                    name="adminReplyToClient"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} rows={6} className="font-mono text-xs"/>
                    )}
                  />
                </div>
                 <div>
                  <h4 className="font-medium text-sm mb-1">Admin's Reply to Agent</h4>
                  <p className="text-sm text-muted-foreground pb-2">Sent to an agent when an admin replies to a ticket.</p>
                  <Controller
                    name="adminReplyToAgent"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} rows={6} className="font-mono text-xs"/>
                    )}
                  />
                </div>
                 <div>
                  <h4 className="font-medium text-sm mb-1">Client's Reply to Admin</h4>
                  <p className="text-sm text-muted-foreground pb-2">Sent to an admin when a client replies to a ticket they're involved in.</p>
                  <Controller
                    name="clientReplyToAdmin"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} rows={6} className="font-mono text-xs"/>
                    )}
                  />
                </div>
                 <div>
                  <h4 className="font-medium text-sm mb-1">Agent's Reply to Admin</h4>
                  <p className="text-sm text-muted-foreground pb-2">Sent to an admin when an agent replies to a ticket they're involved in.</p>
                  <Controller
                    name="agentReplyToAdmin"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} rows={6} className="font-mono text-xs"/>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex justify-end">
            <Button type="submit" disabled>{/*disabled={isPending || !isDirty}*/}
              {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Save Templates
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
