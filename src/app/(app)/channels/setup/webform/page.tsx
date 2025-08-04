
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Copy, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WebformSetupPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const embedCode = `
<form action="${process.env.NEXT_PUBLIC_BASE_URL}/api/webform" method="POST" style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
  <h3 style="text-align: center;">Contact Support</h3>
  <input type="hidden" name="organizationId" value="${user?.organizationId}" />
  <div style="margin-bottom: 15px;">
    <label for="name" style="display: block; margin-bottom: 5px;">Your Name</label>
    <input type="text" id="name" name="name" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  </div>
  <div style="margin-bottom: 15px;">
    <label for="email" style="display: block; margin-bottom: 5px;">Your Email</label>
    <input type="email" id="email" name="email" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  </div>
  <div style="margin-bottom: 15px;">
    <label for="subject" style="display: block; margin-bottom: 5px;">Subject</label>
    <input type="text" id="subject" name="subject" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  </div>
  <div style="margin-bottom: 15px;">
    <label for="description" style="display: block; margin-bottom: 5px;">How can we help?</label>
    <textarea id="description" name="description" rows="5" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
  </div>
  <button type="submit" style="width: 100%; padding: 10px; border: none; border-radius: 4px; background-color: #007bff; color: white; cursor: pointer;">Submit Ticket</button>
</form>
    `.trim();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(embedCode).then(() => {
            toast({ title: 'Copied to clipboard!', description: 'The embed code has been copied.' });
        }).catch(err => {
            toast({ title: 'Failed to copy', description: 'Could not copy the code to your clipboard.', variant: 'destructive' });
        });
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <PageHeader
                title="Embeddable Web Form"
                description="Add a support form to your website to let customers create tickets easily."
            />
             <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>How to use</AlertTitle>
                <AlertDescription>
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                        <li>Copy the HTML code snippet below.</li>
                        <li>Paste it into the HTML of any page on your website where you want the form to appear.</li>
                        <li>You can customize the form's appearance using your own CSS to match your website's design. The provided styles are just a basic starting point.</li>
                    </ol>
                </AlertDescription>
            </Alert>
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>HTML Embed Code</CardTitle>
                        <CardDescription>Copy this code and paste it into your website's HTML.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={copyToClipboard}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Code
                    </Button>
                </CardHeader>
                <CardContent>
                    <pre className="p-4 bg-muted/50 rounded-md overflow-x-auto text-sm">
                        <code>
                            {embedCode}
                        </code>
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
