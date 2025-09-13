

'use client';

import React, { useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { getOrganizationById, updateOrganizationSettings } from '@/lib/firestore';
import type { WhatsAppTemplate } from '@/lib/data';
import { Loader } from 'lucide-react';

const defaultTemplates: WhatsAppTemplate = {
  newTicketConfirmation: `Thanks for contacting us, {{user.name}}! We've received your message and created ticket #{{ticket.id}}. An agent will be with you shortly.`,
  csatRequest: `Thank you for contacting us! How would you rate the support you received? Please reply with a number from 1 (Poor) to 5 (Excellent).`,
};

export function WhatsAppTemplatesForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<Partial<WhatsAppTemplate>>({
    defaultValues: {},
  });

  useEffect(() => {
    if (user?.organizationId) {
      getOrganizationById(user.organizationId).then(org => {
        const currentTemplates = org?.settings?.whatsapp?.templates || {};
        reset({
          newTicketConfirmation: currentTemplates.newTicketConfirmation || defaultTemplates.newTicketConfirmation,
          csatRequest: currentTemplates.csatRequest || defaultTemplates.csatRequest,
        });
      });
    }
  }, [user, reset]);

  const onSubmit = (data: Partial<WhatsAppTemplate>) => {
    if (!user) return;
    startTransition(async () => {
      try {
        await updateOrganizationSettings(user.organizationId, { 'whatsapp.templates': data });
        toast({ title: 'Success', description: 'WhatsApp templates have been saved.' });
        reset(data); // Resets the dirty state
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to save WhatsApp templates.', variant: 'destructive' });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Templates</CardTitle>
        <CardDescription>
          Customize the content of automated WhatsApp messages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
           <div>
              <h4 className="font-medium text-sm mb-1">New Ticket Confirmation</h4>
              <p className="text-sm text-muted-foreground pb-2">Sent when a new ticket is created via WhatsApp.</p>
              <Controller
                name="newTicketConfirmation"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} rows={4} className="font-mono text-xs"/>
                )}
              />
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Customer Satisfaction (CSAT) Request</h4>
              <p className="text-sm text-muted-foreground pb-2">Sent when a WhatsApp ticket is closed.</p>
              <Controller
                name="csatRequest"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} rows={4} className="font-mono text-xs"/>
                )}
              />
            </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !isDirty}>
              {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Save WhatsApp Templates
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
