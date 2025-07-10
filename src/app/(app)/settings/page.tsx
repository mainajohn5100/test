
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

export default function SettingsPage() {
  const { user } = useAuth();
  const { 
    inAppNotifications, 
    setInAppNotifications,
    emailNotifications,
    setEmailNotifications,
    agentPanelEnabled,
    setAgentPanelEnabled,
    customerPanelEnabled,
    setCustomerPanelEnabled,
    customerCanSelectProject,
    setCustomerCanSelectProject
  } = useSettings();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure application settings and integrations."
      />
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList>
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
                Manage how you receive notifications from the application.
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
              <EmailIntegrationForm />
          </TabsContent>
        )}
         {user?.role === 'Admin' && (
          <TabsContent value="access">
              <Card>
                  <CardHeader>
                      <CardTitle>Access Control</CardTitle>
                      <CardDescription>
                          Globally enable or disable access for different user roles.
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
                              <Label htmlFor="customer-panel" className="text-base">
                                  Customer Panel
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                  Enable access for users with the 'Customer' role.
                              </p>
                          </div>
                          <Switch
                              id="customer-panel"
                              checked={customerPanelEnabled}
                              onCheckedChange={setCustomerPanelEnabled}
                              aria-label="Toggle customer panel access"
                          />
                      </div>
                       <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                              <Label htmlFor="customer-project" className="text-base">
                                  Customer Can Select Project
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                  Allow customers to assign tickets to projects during creation.
                              </p>
                          </div>
                          <Switch
                              id="customer-project"
                              checked={customerCanSelectProject}
                              onCheckedChange={setCustomerCanSelectProject}
                              aria-label="Toggle customer project selection"
                          />
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
         )}
        <TabsContent value="account">
            <AccountForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
