
'use client';

import { PageHeader } from "@/components/page-header";
import { EmailIntegrationForm } from "@/components/settings/email-integration-form";

export default function EmailSetupPage() {

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <PageHeader
                title="Configure Email Channel"
                description="Automatically convert emails sent to your support address into tickets."
            />
            <EmailIntegrationForm />
        </div>
    );
}
