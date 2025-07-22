
'use client';

import { PageHeader } from "@/components/page-header";
import { WhatsAppIntegrationForm } from "@/components/settings/whatsapp-integration-form";

export default function WhatsAppSetupPage() {

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <PageHeader
                title="Configure WhatsApp Channel"
                description="Enable two-way conversations with your clients via WhatsApp using Twilio."
            />
            <WhatsAppIntegrationForm />
        </div>
    );
}
