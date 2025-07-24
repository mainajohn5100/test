
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader, Plus, Trash2, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function StatusTagsForm() {
  const { ticketStatuses, setTicketStatuses, loading } = useSettings();
  const { toast } = useToast();
  const [newStatus, setNewStatus] = useState('');
  const [isSaving, startTransition] = React.useTransition();

  const handleAddStatus = () => {
    if (newStatus && !ticketStatuses.includes(newStatus)) {
        startTransition(async () => {
            const success = await setTicketStatuses([...ticketStatuses, newStatus]);
            if (success) {
              setNewStatus('');
              toast({ title: 'Status Added' });
            } else {
              toast({ title: 'Error', description: 'Failed to add status.', variant: 'destructive' });
            }
        });
    }
  };

  const handleRemoveStatus = (statusToRemove: string) => {
    startTransition(async () => {
        const newStatuses = ticketStatuses.filter(s => s !== statusToRemove);
        const success = await setTicketStatuses(newStatuses);
        if (success) {
            toast({ title: 'Status Removed' });
        } else {
            toast({ title: 'Error', description: 'Failed to remove status.', variant: 'destructive' });
        }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Statuses</CardTitle>
        <CardDescription>
          Customize the ticket status tags for your organization's workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <label htmlFor="new-status-input" className="text-sm font-medium">Add New Status</label>
            <div className="flex gap-2">
                <Input
                    id="new-status-input"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    placeholder="e.g., Escalated"
                />
                <Button onClick={handleAddStatus} disabled={!newStatus.trim() || isSaving}>
                    {isSaving ? <Loader className="h-4 w-4 animate-spin"/> : <Plus className="mr-2 h-4 w-4" />}
                    Add
                </Button>
            </div>
        </div>
        
        <div className="space-y-2">
            <p className="text-sm font-medium">Current Statuses</p>
            {loading ? (
                <div className="flex items-center justify-center p-4">
                    <Loader className="h-6 w-6 animate-spin" />
                </div>
            ) : (
                <div className="flex flex-wrap gap-2 rounded-lg border p-4 min-h-20">
                    {ticketStatuses.map(status => (
                        <Badge key={status} variant="outline" className="text-base py-1 px-3 group">
                            {status}
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to delete this status?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. Deleting the status "{status}" will not change existing tickets with this status, but it will no longer be an option for new assignments.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRemoveStatus(status)} className="bg-destructive hover:bg-destructive/90">
                                            {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
