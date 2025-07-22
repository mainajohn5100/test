
'use client';

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const channels = [
    {
        name: 'Email',
        description: 'Convert emails sent to your support address into tickets automatically.',
        icon: Mail,
        href: '/channels/setup/email',
        tags: ['Resend']
    },
    {
        name: 'WhatsApp',
        description: 'Enable two-way conversations and create tickets from WhatsApp messages.',
        icon: MessageCircle,
        href: '/channels/setup/whatsapp',
        tags: ['Twilio']
    }
]

export default function AddChannelPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Add a New Channel"
                description="Select a channel to integrate with your workspace."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map((channel) => (
                    <Card key={channel.name} className="flex flex-col">
                        <CardHeader className="flex-row items-center gap-4">
                            <channel.icon className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <CardTitle>{channel.name}</CardTitle>
                                {channel.tags && (
                                    <div className="flex gap-1.5 mt-1">
                                        {channel.tags.map(tag => (
                                            <span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>{channel.description}</CardDescription>
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Link href={channel.href}>
                                <Button className="w-full">
                                    Configure
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
