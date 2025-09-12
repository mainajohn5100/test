

'use client';

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceForm } from "@/components/settings/appearance-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/contexts/settings-context";
import { AccountForm } from "@/components/settings/account-form";
import { useAuth } from "@/contexts/auth-context";
import { EmailTemplatesForm } from "@/components/settings/email-templates-form";
import { Loader } from "lucide-react";
import { StatusTagsForm } from "@/components/settings/status-tags-form";
import { CannedResponsesForm } from "@/components/settings/canned-responses-form";
import { SlaPoliciesForm } from "@/components/settings/sla-policies-form";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const settings = useSettings();
  
  if (authLoading || settings.loading) {
     return (
      <div className="flex flex-col gap-6">
          <PageHeader
            title="Settings"
            description="Configure application settings and preferences."
          />
          <div className="flex h-48 items-center justify-center">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure application settings and preferences."
      />
      <Tabs defaultValue="personalization" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {user?.role === 'Admin' && <TabsTrigger value="access">Access Control</TabsTrigger>}
          <TabsTrigger value="account">Account</TabsTrigger>
          {user?.role === 'Admin' && <TabsTrigger value="templates">Email Templates</TabsTrigger>}
          {user?.role === 'Admin' && <TabsTrigger value="workflow">Workflow</TabsTrigger>}
        </TabsList>

        <TabsContent value="personalization">
            <Card>
                <CardHeader>
                    <CardTitle>Personalization</CardTitle>
                    <CardDescription>
                        Customize the look and feel of your dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AppearanceForm />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications from the application. These settings are local to your browser and organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="in-app-notifications" className="text-base">
                      In-App Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications within the app header.
                    </p>
                  </div>
                  <Switch
                    id="in-app-notifications"
                    checked={settings.inAppNotifications}
                    onCheckedChange={settings.setInAppNotifications}
                    aria-label="Toggle in-app notifications"
                  />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for important events via email.
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={settings.setEmailNotifications}
                    aria-label="Toggle email notifications"
                    disabled
                  />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
         {user?.role === 'Admin' && (
          <TabsContent value="access">
            <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Access & Permissions</CardTitle>
                      <CardDescription>
                          Globally enable or disable access and permissions for different user roles. These settings affect all users in your organization.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                              <Label htmlFor="agent-panel" className="text-base">
                                  Agent Panel
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                  Enable access for users with the 'Agent' role.
                              </p>
                          </div>
                          <Switch
                              id="agent-panel"
                              checked={settings.agentPanelEnabled}
                              onCheckedChange={settings.setAgentPanelEnabled}
                              aria-label="Toggle agent panel access"
                          />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                              <Label htmlFor="client-panel" className="text-base">
                                  Client Panel
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                  Enable access for users with the 'Client' role.
                              </p>
                          </div>
                          <Switch
                              id="client-panel"
                              checked={settings.clientPanelEnabled}
                              onCheckedChange={settings.setClientPanelEnabled}
                              aria-label="Toggle client panel access"
                          />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="projects-enabled" className="text-base">
                                Enable Projects Module
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Globally enable or disable the Projects feature.
                            </p>
                        </div>
                        <Switch
                            id="projects-enabled"
                            checked={settings.projectsEnabled}
                            onCheckedChange={settings.setProjectsEnabled}
                            aria-label="Toggle projects module"
                        />
                       </div>
                       {settings.projectsEnabled && (
                        <>
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="client-project" className="text-base">
                                    Client Can Select Project
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow clients to assign tickets to projects during creation.
                                </p>
                            </div>
                            <Switch
                                id="client-project"
                                checked={settings.clientCanSelectProject}
                                onCheckedChange={settings.setClientCanSelectProject}
                                aria-label="Toggle client project selection"
                            />
                          </div>
                        </>
                       )}
                  </CardContent>
              </Card>
            </div>
          </TabsContent>
         )}
        <TabsContent value="account">
            <AccountForm />
        </TabsContent>
        {user?.role === 'Admin' && (
          <TabsContent value="templates">
            <EmailTemplatesForm />
          </TabsContent>
        )}
        {user?.role === 'Admin' && (
            <TabsContent value="workflow">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StatusTagsForm />
                    <CannedResponsesForm />
                    <div className="lg:col-span-2">
                        <SlaPoliciesForm />
                    </div>
                </div>
            </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
