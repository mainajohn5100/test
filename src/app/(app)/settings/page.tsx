

'use client';

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceForm } from "@/components/settings/appearance-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/contexts/settings-context";
import { EmailIntegrationForm } from "@/components/settings/email-integration-form";
import { AccountForm } from "@/components/settings/account-form";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { EmailTemplatesForm } from "@/components/settings/email-templates-form";

export default function SettingsPage() {
  const { user } = useAuth();
  const { 
    inAppNotifications, 
    setInAppNotifications,
    emailNotifications,
    setEmailNotifications,
    agentPanelEnabled,
    setAgentPanelEnabled,
    clientPanelEnabled,
    setClientPanelEnabled,
    clientCanSelectProject,
    setClientCanSelectProject,
    agentCanEditTeam,
    setAgentCanEditTeam,
  } = useSettings();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure application settings and integrations."
      />
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {user?.role === 'Admin' && <TabsTrigger value="integrations">Integrations</TabsTrigger>}
          {user?.role === 'Admin' && <TabsTrigger value="access">Access Control</TabsTrigger>}
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
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
                Manage how you receive notifications from the application. These settings are local to your browser.
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
                    checked={inAppNotifications}
                    onCheckedChange={setInAppNotifications}
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
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    aria-label="Toggle email notifications"
                  />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        {user?.role === 'Admin' && (
          <TabsContent value="integrations">
            <div className="space-y-6">
              <EmailIntegrationForm />
              <EmailTemplatesForm />
            </div>
          </TabsContent>
        )}
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
                              checked={agentPanelEnabled}
                              onCheckedChange={setAgentPanelEnabled}
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
                              checked={clientPanelEnabled}
                              onCheckedChange={setClientPanelEnabled}
                              aria-label="Toggle client panel access"
                          />
                      </div>
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
                              checked={clientCanSelectProject}
                              onCheckedChange={setClientCanSelectProject}
                              aria-label="Toggle client project selection"
                          />
                      </div>
                       <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                              <Label htmlFor="agent-can-edit-team" className="text-base">
                                  Agent Can Add Team Members
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                  Allow agents who are project creators to add or remove team members from projects.
                              </p>
                          </div>
                          <Switch
                              id="agent-can-edit-team"
                              checked={agentCanEditTeam}
                              onCheckedChange={setAgentCanEditTeam}
                              aria-label="Toggle agent team editing"
                          />
                      </div>
                  </CardContent>
              </Card>
            </div>
          </TabsContent>
         )}
        <TabsContent value="account">
            <AccountForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
