
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Mail, Copy } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateOrganizationSettings } from '@/lib/firestore';

export function EmailIntegrationForm() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { supportEmail, setSupportEmail } = useSettings();
    const [isEnabled, setIsEnabled] = React.useState(false);
    
    // Generate a unique, stable alias for the user's inbound email
    const inboundAlias = React.useMemo(() => {
      if (!user) return 'your-unique-alias';
      // Simple hash to create a somewhat unique but stable alias from user ID
      const hash = user.id.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      return `inbound-${(hash & 0x7FFFFFFF).toString(16)}`;
    }, [user]);

    const inboundAddress = `${inboundAlias}@inbound.requestflow.app`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inboundAddress).then(() => {
            toast({ title: 'Copied to clipboard!', description: 'The inbound email address has been copied.' });
        }, (err) => {
            toast({ title: 'Failed to copy', description: 'Could not copy the address to your clipboard.', variant: 'destructive' });
            console.error('Could not copy text: ', err);
        });
    };
    
    const handleSave = async () => {
        if (!user) return;
        try {
            await updateOrganizationSettings(user.organizationId, { supportEmail });
            toast({ title: "Settings Saved", description: "Your public support email has been updated." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        }
    };


    const effectiveSupportEmail = supportEmail || user?.email;

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
                    <Label htmlFor="support-email">Your Public Support Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="support-email" 
                            type="email" 
                            placeholder={user?.email || "e.g., support@yourcompany.com"}
                            value={supportEmail}
                            onChange={(e) => setSupportEmail(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Enter your company's support email. If left blank, your account email ({user?.email}) will be used.
                    </p>
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="forwarding-address">Your Unique Forwarding Address</Label>
                    <div className="relative">
                        <Input 
                            id="forwarding-address" 
                            type="text" 
                            readOnly 
                            value={inboundAddress}
                            className="pr-10 bg-muted/50"
                        />
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onClick={copyToClipboard}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        To complete setup, configure your support inbox (<span className="font-semibold text-foreground">{effectiveSupportEmail}</span>) to automatically forward all incoming mail to this unique address.
                    </p>
                </div>
                 <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Email Settings</Button>
                </div>
            </CardContent>
        </Card>
    );
}
