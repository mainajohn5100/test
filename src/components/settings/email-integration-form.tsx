
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Mail } from 'lucide-react';

export function EmailIntegrationForm() {
    const [isEnabled, setIsEnabled] = React.useState(false);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Email Integration</CardTitle>
                <CardDescription>
                    Automatically convert emails sent to your support address into tickets.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="enable-email-integration" className="text-base">
                            Enable Email-to-Ticket
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Turn on the email processor to create tickets from incoming emails.
                        </p>
                    </div>
                    <Switch
                        id="enable-email-integration"
                        checked={isEnabled}
                        onCheckedChange={setIsEnabled}
                        aria-label="Toggle email-to-ticket integration"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="support-email">Your Support Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="support-email" 
                            type="email" 
                            readOnly 
                            value="support@requestflow.app"
                            className="pl-9 bg-muted/50"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This is your dedicated email address. Emails sent here will become tickets. This address cannot be changed at this time.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
