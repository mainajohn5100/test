import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure application settings and integrations."
      />
      <Card>
        <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Manage your preferences for RequestFlow.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Email Integration</h3>
            <p className="text-sm text-muted-foreground">
                Connect your email accounts to automatically convert emails into tickets.
            </p>
            <Button>Connect Email Account</Button>
          </div>
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">Knowledge Base</h3>
            <p className="text-sm text-muted-foreground">
                Manage your self-help articles and FAQs.
            </p>
            <Button>Go to Knowledge Base</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
