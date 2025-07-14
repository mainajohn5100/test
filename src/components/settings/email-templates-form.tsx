
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
  newAssignee: `Hi {{user.name}},\n\nYou have been assigned a new ticket: "{{ticket.title}}".\n\n- The Support Team`
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
          Customize the content of automated emails sent to clients. Use placeholders like `{{ticket.title}}` or `{{user.name}}`.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>New Ticket Auto-Reply</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground pb-2">Sent to a client when a new ticket is created via email.</p>
                <Controller
                  name="newTicketAutoReply"
                  control={control}
                  render={({ field }) => (
                    <Textarea {...field} rows={6} className="font-mono text-xs"/>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Status Change Notification</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground pb-2">Sent to a client when their ticket's status is updated.</p>
                <Controller
                  name="statusChange"
                  control={control}
                  render={({ field }) => (
                    <Textarea {...field} rows={6} className="font-mono text-xs"/>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Priority Change Notification</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground pb-2">Sent to a client when their ticket's priority is updated.</p>
                <Controller
                  name="priorityChange"
                  control={control}
                  render={({ field }) => (
                    <Textarea {...field} rows={6} className="font-mono text-xs"/>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>New Assignee Notification</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground pb-2">Sent to an agent when they are assigned a new ticket.</p>
                <Controller
                  name="newAssignee"
                  control={control}
                  render={({ field }) => (
                    <Textarea {...field} rows={6} className="font-mono text-xs"/>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !isDirty}>
              {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Save Templates
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
