
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
    setCustomerCanSelectProject,
    agentCanEditTeam,
    setAgentCanEditTeam,
    adminEmailPattern,
    setAdminEmailPattern,
    agentEmailPattern,
    setAgentEmailPattern,
    agentSignupEnabled,
    setAgentSignupEnabled,
    customerSignupEnabled,
    setCustomerSignupEnabled,
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
            <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Panel Access</CardTitle>
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
                       <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                              <Label htmlFor="agent-can-edit-team" className="text-base">
                                  Agent Can Add Team Members
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                  Allow agents to add or remove team members from projects.
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
              <Card>
                  <CardHeader>
                      <CardTitle>Signup Control</CardTitle>
                      <CardDescription>
                          Enable or disable public account creation for different roles. Admins can always be created from the user management page.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                              <Label htmlFor="agent-signup-enabled" className="text-base">
                                  Enable Agent Signup
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                  Allow users to sign up as Agents if their email matches the agent pattern.
                              </p>
                          </div>
                          <Switch
                              id="agent-signup-enabled"
                              checked={agentSignupEnabled}
                              onCheckedChange={setAgentSignupEnabled}
                              aria-label="Toggle Agent Signup"
                          />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                              <Label htmlFor="customer-signup-enabled" className="text-base">
                                  Enable Customer Signup
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                  Allow users to sign up as Customers if their email does not match other patterns.
                              </p>
                          </div>
                          <Switch
                              id="customer-signup-enabled"
                              checked={customerSignupEnabled}
                              onCheckedChange={setCustomerSignupEnabled}
                              aria-label="Toggle Customer Signup"
                          />
                      </div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle>Role Assignment by Email</CardTitle>
                      <CardDescription>
                          Automatically assign roles to new users based on their email address. 
                          Use `*` as a wildcard (e.g., `*@company.com`).
                          Any email that doesn't match a pattern will be assigned the 'Customer' role.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="space-y-2">
                          <Label htmlFor="admin-pattern">Admin Email Pattern</Label>
                          <Input 
                            id="admin-pattern"
                            value={adminEmailPattern}
                            onChange={(e) => setAdminEmailPattern(e.target.value)}
                            placeholder="e.g., *.admin@requestflow.app, admin@company.com"
                          />
                           <p className="text-xs text-muted-foreground">
                            The primary billing email is always a super-admin.
                          </p>
                      </div>
                       <div className="space-y-2">
                          <Label htmlFor="agent-pattern">Agent Email Pattern</Label>
                          <Input 
                            id="agent-pattern"
                            value={agentEmailPattern}
                            onChange={(e) => setAgentEmailPattern(e.target.value)}
                            placeholder="e.g., *.agent@requestflow.app, support@company.com"
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
