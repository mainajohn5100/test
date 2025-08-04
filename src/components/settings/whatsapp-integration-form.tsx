
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Phone, KeyRound, Loader, Copy, CircleHelp } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Textarea } from '../ui/textarea';

export function WhatsAppIntegrationForm() {
    const { toast } = useToast();
    const { whatsappSettings, setWhatsappSettings } = useSettings();
    const [isSaving, startTransition] = React.useTransition();
    
    const [sid, setSid] = useState('');
    const [token, setToken] = useState('');
    const [phone, setPhone] = useState('');
    const [template, setTemplate] = useState('');
    
    useEffect(() => {
        if (whatsappSettings) {
            setSid(whatsappSettings.accountSid || '');
            setToken(whatsappSettings.authToken || '');
            setPhone(whatsappSettings.phoneNumber || '');
            setTemplate(whatsappSettings.newTicketTemplate || '');
        }
    }, [whatsappSettings]);
    
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://requestflow.netlify.app'}/api/inbound-whatsapp`;

    const handleSave = () => {
        if (!sid || !token || !phone) {
            toast({ title: 'Missing Information', description: 'Please fill out all API credential fields.', variant: 'destructive' });
            return;
        }

        startTransition(async () => {
            const success = await setWhatsappSettings({
                provider: 'twilio',
                accountSid: sid,
                authToken: token,
                phoneNumber: phone,
                newTicketTemplate: template,
            });
            if (success) {
                toast({ title: "Settings Saved", description: "Your WhatsApp integration settings have been updated." });
            } else {
                toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
            }
        });
    };
    
     const copyToClipboard = () => {
        navigator.clipboard.writeText(webhookUrl).then(() => {
            toast({ title: 'Copied to clipboard!', description: 'The webhook URL has been copied.' });
        }, (err) => {
            toast({ title: 'Failed to copy', description: 'Could not copy the URL to your clipboard.', variant: 'destructive' });
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Twilio Configuration</CardTitle>
                <CardDescription>
                    Connect your WhatsApp number via the Twilio API.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <Alert>
                  <CircleHelp className="h-4 w-4" />
                  <AlertTitle>How to Connect Your Number</AlertTitle>
                  <AlertDescription>
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                        <li>Ensure you have a <a href="https://business.facebook.com/overview" target="_blank" rel="noopener noreferrer" className="underline">Facebook Business Manager</a> account.</li>
                        <li>Create or log in to your <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer" className="underline">Twilio account</a>.</li>
                        <li>Follow Twilio's guide to <a href="https://www.twilio.com/docs/whatsapp/self-sign-up" target="_blank" rel="noopener noreferrer" className="underline">connect your WhatsApp Business Profile</a>. You will verify ownership of your number during this process.</li>
                        <li>Once complete, find your **Account SID** and **Auth Token** on your Twilio Console dashboard.</li>
                        <li>Enter your credentials and phone number below.</li>
                        <li>Copy the webhook URL below and paste it into your Twilio phone number's messaging configuration for "A MESSAGE COMES IN".</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                 <div className="space-y-2">
                    <Label htmlFor="webhook-url">Your Webhook URL</Label>
                    <div className="relative">
                        <Input 
                            id="webhook-url" 
                            type="text" 
                            readOnly 
                            value={webhookUrl}
                            className="pr-10 bg-muted/50"
                        />
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onClick={copyToClipboard}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Set this URL in your Twilio phone number's messaging configuration.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="twilio-sid">Twilio Account SID</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="twilio-sid" 
                            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            value={sid}
                            onChange={(e) => setSid(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="twilio-token">Twilio Auth Token</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="twilio-token"
                            type="password"
                            placeholder="Your Twilio auth token"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                
                 <div className="space-y-2">
                    <Label htmlFor="twilio-phone">Your Business's WhatsApp Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="twilio-phone"
                            placeholder="+14155238886"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                     <p className="text-sm text-muted-foreground">
                        The number you registered on the WhatsApp Business Platform.
                    </p>
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="whatsapp-template">New Ticket Auto-Reply Template</Label>
                     <Textarea
                        id="whatsapp-template"
                        placeholder="Your auto-reply message..."
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        rows={4}
                     />
                    <p className="text-sm text-muted-foreground">
                        Use placeholders like `{{user.name}}` and `{{ticket.id}}` to customize the message.
                    </p>
                </div>
                
                 <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Save WhatsApp Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
