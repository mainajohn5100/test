
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';


const plans = [
    {
        name: 'Free',
        price: 'Kes 0',
        features: ['Up to 5 users', 'Basic ticket management', 'Community support'],
        cta: 'Your Current Plan'
    },
    {
        name: 'Pro',
        price: 'Kes 2,999',
        priceSuffix: '/ month',
        features: ['Up to 25 users', 'Advanced reporting', 'Project management', 'SLA policies', 'Priority support'],
        cta: 'Upgrade to Pro'
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        features: ['Unlimited users', 'Dedicated support', 'Custom integrations', 'On-premise option'],
        cta: 'Contact Sales'
    }
]

export default function BillingPage() {
    const { user } = useAuth();
    
    if (user?.role !== 'Admin') {
        return (
            <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
                <div className="flex flex-col items-center justify-center text-center">
                    <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-2xl font-bold">Access Denied</h2>
                    <p className="text-muted-foreground max-w-sm mt-2">
                        Only administrators can manage billing and subscriptions.
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
                title="Billing & Subscription"
                description="Manage your subscription plan and view billing history."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                     <Card key={plan.name} className={`flex flex-col ${plan.name === 'Pro' ? 'border-primary' : ''}`}>
                        <CardHeader>
                            <div className="flex justify-between items-baseline">
                                <CardTitle>{plan.name}</CardTitle>
                                {plan.name === 'Pro' && <span className="text-xs font-semibold text-primary">Most Popular</span>}
                            </div>
                            <div className="flex items-baseline">
                                <span className="text-3xl font-bold">{plan.price}</span>
                                {plan.priceSuffix && <span className="text-muted-foreground">{plan.priceSuffix}</span>}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <div className="p-6 pt-0">
                             <Button className="w-full" disabled={plan.name === 'Free'}>
                                {plan.cta}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>You have not made any payments yet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Your payment history will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
