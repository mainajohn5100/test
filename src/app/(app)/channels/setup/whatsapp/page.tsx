
'use client';

import { PageHeader } from "@/components/page-header";
import { WhatsAppIntegrationForm } from "@/components/settings/whatsapp-integration-form";

export default function WhatsAppSetupPage() {

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <PageHeader
                title="Connect Your WhatsApp Number"
                description="Follow the steps below to connect your business's existing WhatsApp number using the Twilio API."
            />
            <WhatsAppIntegrationForm />
        </div>
    );
}
