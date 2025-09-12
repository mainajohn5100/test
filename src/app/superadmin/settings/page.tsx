
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { KeyRound } from 'lucide-react';
import { AppearanceForm } from '@/components/settings/appearance-form';

export default function SuperAdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Superadmin Settings"
        description="Manage global platform settings and configurations."
      />
      <Tabs defaultValue="personalization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>
        <TabsContent value="personalization">
            <Card>
                <CardHeader>
                    <CardTitle>Personalization</CardTitle>
                    <CardDescription>
                        Customize the look and feel of the superadmin dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AppearanceForm />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage security settings for the entire platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor" className="text-base">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Require all administrators to use two-factor authentication.
                    </p>
                  </div>
                  <Switch
                    id="two-factor"
                    aria-label="Toggle two-factor authentication"
                    disabled
                  />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="session-timeout" className="text-base">
                      Global Session Timeout
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Set a global session timeout for all users on the platform.
                    </p>
                  </div>
                  <Button variant="outline" disabled>Configure</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for third-party integrations and services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                        <p className="font-mono text-sm flex items-center gap-2"><KeyRound className="h-4 w-4 text-muted-foreground" /> <span>resend_******************</span></p>
                        <p className="text-xs text-muted-foreground pl-6">Used for sending transactional emails.</p>
                    </div>
                    <Button variant="secondary" size="sm" disabled>Revoke</Button>
               </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                        <p className="font-mono text-sm flex items-center gap-2"><KeyRound className="h-4 w-4 text-muted-foreground" /> <span>twilio_******************</span></p>
                        <p className="text-xs text-muted-foreground pl-6">Used for WhatsApp messaging integration.</p>
                    </div>
                    <Button variant="secondary" size="sm" disabled>Revoke</Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
