
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Plus, Trash2 } from 'lucide-react';
import { CannedResponse } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';

function CannedResponseDialog({ 
    response,
    onSave,
    children
}: {
    response?: CannedResponse;
    onSave: (data: CannedResponse) => void;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CannedResponse>({
        defaultValues: response || { title: '', content: '' }
    });

    React.useEffect(() => {
        if (open) {
            reset(response || { title: '', content: '' });
        }
    }, [open, response, reset]);

    const handleSave = (data: CannedResponse) => {
        onSave(data);
        setOpen(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{response ? 'Edit' : 'Create'} Canned Response</DialogTitle>
                    <DialogDescription>
                        Create a reusable template for common replies.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                    <div>
                        <Input
                            placeholder="Response Title (e.g., 'Password Reset')"
                            {...register('title', { required: 'Title is required' })}
                        />
                        {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                        <Textarea
                            placeholder="Response content..."
                            rows={6}
                            {...register('content', { required: 'Content is required' })}
                        />
                         {errors.content && <p className="text-destructive text-sm mt-1">{errors.content.message}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost" type="button">Cancel</Button></DialogClose>
                        <Button type="submit">Save Response</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function CannedResponsesForm() {
    const { cannedResponses, setCannedResponses, loading } = useSettings();
    const { toast } = useToast();
    const [isSaving, startTransition] = React.useTransition();

    const handleSave = (responses: CannedResponse[]) => {
        startTransition(async () => {
            const success = await setCannedResponses(responses);
            if (success) {
                toast({ title: 'Canned responses updated.' });
            } else {
                toast({ title: 'Error', description: 'Failed to update responses.', variant: 'destructive' });
            }
        });
    }
    
    const addResponse = (data: CannedResponse) => {
        handleSave([...cannedResponses, data]);
    }

    const updateResponse = (index: number, data: CannedResponse) => {
        const newResponses = [...cannedResponses];
        newResponses[index] = data;
        handleSave(newResponses);
    }

    const deleteResponse = (index: number) => {
        const newResponses = cannedResponses.filter((_, i) => i !== index);
        handleSave(newResponses);
    }

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Canned Responses</CardTitle>
                    <CardDescription>
                        Create and manage templates for quick replies.
                    </CardDescription>
                </div>
                <CannedResponseDialog onSave={addResponse}>
                    <Button size="icon" variant="ghost">
                        <Plus className="h-4 w-4" />
                    </Button>
                </CannedResponseDialog>
            </CardHeader>
            <CardContent className="space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    cannedResponses.map((res, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-3 pr-2">
                            <div className="truncate">
                                <p className="font-medium truncate">{res.title}</p>
                                <p className="text-sm text-muted-foreground truncate">{res.content}</p>
                            </div>
                            <div className="flex items-center shrink-0">
                                <CannedResponseDialog response={res} onSave={(data) => updateResponse(index, data)}>
                                     <Button variant="ghost" size="sm">Edit</Button>
                                </CannedResponseDialog>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteResponse(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
                 {cannedResponses.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground py-4">No canned responses created yet.</p>
                )}
            </CardContent>
        </Card>
    );
}
