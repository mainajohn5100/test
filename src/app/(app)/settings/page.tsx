import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceForm } from "@/components/settings/appearance-form";

export default function SettingsPage() {
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
          <TabsTrigger value="integrations" disabled>Integrations</TabsTrigger>
          <TabsTrigger value="account" disabled>Account</TabsTrigger>
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
                Manage how you receive notifications. (Coming soon!)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p>Detailed notification settings will be available here in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
