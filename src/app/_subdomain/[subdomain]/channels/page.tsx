

'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle2, Settings, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from '@/contexts/settings-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChannelsPage() {
    const { whatsappSettings, supportEmail, loading } = useSettings();

    const isWhatsAppConfigured = !!(whatsappSettings?.accountSid && whatsappSettings?.authToken && whatsappSettings?.phoneNumber);
    const isEmailConfigured = !!supportEmail;

    const channels = [
        {
            name: 'Email',
            description: 'Convert emails into tickets.',
            icon: Mail,
            configured: isEmailConfigured,
            href: '/channels/setup/email',
            tags: ['Resend']
        },
        {
            name: 'WhatsApp',
            description: 'Two-way chat via WhatsApp.',
            icon: MessageCircle,
            configured: isWhatsAppConfigured,
            href: '/channels/setup/whatsapp',
            tags: ['Twilio']
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                 <PageHeader
                    title="Channels"
                    description="Manage your communication channels and integrations."
                >
                    <Skeleton className="h-10 w-36" />
                </PageHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex-row items-center gap-4">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    
    const configuredChannels = channels.filter(c => c.configured);
    const availableChannels = channels.filter(c => !c.configured);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Channels"
                description="Manage your communication channels and integrations."
            >
                <Link href="/channels/new" passHref>
                    <Button>
                        <PlusCircle />
                        Add Channel
                    </Button>
                </Link>
            </PageHeader>
            
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Configured Channels</h2>
                {configuredChannels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {configuredChannels.map(channel => (
                            <Card key={channel.name}>
                                <CardHeader className="flex-row items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <channel.icon className="h-8 w-8 text-muted-foreground" />
                                        <CardTitle>{channel.name}</CardTitle>
                                    </div>
                                    <Link href={channel.href}>
                                        <Button variant="ghost" size="icon">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Active and configured</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">You haven't configured any channels yet.</p>
                        <Link href="/channels/new" passHref>
                            <Button variant="link">Add your first channel</Button>
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}
