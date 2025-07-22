
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

export function WhatsAppIntegrationForm() {
    const { toast } = useToast();
    const { whatsappSettings, setWhatsappSettings } = useSettings();
    const [isSaving, startTransition] = React.useTransition();
    
    // Safely initialize state, defaulting to empty strings if whatsappSettings is not yet available.
    const [sid, setSid] = useState('');
    const [token, setToken] = useState('');
    const [phone, setPhone] = useState('');
    
    // Effect to update local state once settings are loaded from context.
    useEffect(() => {
        if (whatsappSettings) {
            setSid(whatsappSettings.accountSid || '');
            setToken(whatsappSettings.authToken || '');
            setPhone(whatsappSettings.phoneNumber || '');
        }
    }, [whatsappSettings]); 
    //TODO - replace the base URL with a custom one, after acquisition.
    //TODO - add NEXT_PUBLIC_BASE_URL to .env
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://requestflow.netlify.app'}/api/inbound-whatsapp`;

    const handleSave = () => {
        if (!sid || !token || !phone) {
            toast({ title: 'Missing Information', description: 'Please fill out all fields.', variant: 'destructive' });
            return;
        }

        startTransition(async () => {
            try {
                await setWhatsappSettings({
                    provider: 'twilio',
                    accountSid: sid,
                    authToken: token,
                    phoneNumber: phone,
                });
                toast({ title: "Settings Saved", description: "Your WhatsApp integration settings have been updated." });
            } catch (error) {
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
                <CardTitle>WhatsApp Integration (Twilio)</CardTitle>
                <CardDescription>
                    Receive tickets from WhatsApp by connecting your Twilio account.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <Alert>
                  <CircleHelp className="h-4 w-4" />
                  <AlertTitle>Setup Instructions</AlertTitle>
                  <AlertDescription>
                    1. Get a Twilio account and a WhatsApp-enabled phone number. <br />
                    2. Enter your Account SID, Auth Token, and Twilio number below. <br />
                    3. In your Twilio console, configure the webhook for incoming messages to point to the URL provided.
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
                    <Label htmlFor="twilio-phone">Your Business's Twilio WhatsApp Number</Label>
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
