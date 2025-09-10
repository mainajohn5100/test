
'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Loader, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function OrganizationPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (user?.role !== 'Admin') {
        return (
            <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
                <div className="flex flex-col items-center justify-center text-center">
                    <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-2xl font-bold">Access Denied</h2>
                    <p className="text-muted-foreground max-w-sm mt-2">
                        You do not have permission to view this page.
                    </p>
                    <Link href="/dashboard" passHref>
                        <Button className="mt-6">Return to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Organization Settings"
                description="Manage your organization details, team members, and subscription."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                   <p>Organization Details Card will go here</p>
                   <p>Team Members Card will go here</p>
                </div>
                <div className="lg:col-span-1">
                   <p>Subscription Card will go here</p>
                </div>
            </div>
        </div>
    );
}

