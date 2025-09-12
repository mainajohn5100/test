
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, Smartphone } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


const plans = [
    {
        name: 'Free',
        price: 'Kes 0',
        features: ['Up to 5 users', 'Basic ticket management', 'Community support'],
        cta: 'Your Current Plan',
        isCurrent: true,
    },
    {
        name: 'Pro',
        price: 'Kes 2,999',
        priceSuffix: '/ month',
        features: ['Up to 25 users', 'Advanced reporting', 'Project management', 'SLA policies', 'Priority support'],
        cta: 'Upgrade to Pro',
        isPopular: true,
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
                description="Manage your subscription plan and payment methods."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                     <Card key={plan.name} className={`flex flex-col ${plan.isPopular ? 'border-primary' : ''}`}>
                        <CardHeader>
                            <div className="flex justify-between items-baseline">
                                <CardTitle>{plan.name}</CardTitle>
                                {plan.isPopular && <span className="text-xs font-semibold text-primary">Most Popular</span>}
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
                             <Button className="w-full" disabled={plan.isCurrent}>
                                {plan.cta}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>Select your preferred payment method and proceed to upgrade.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="card">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="card">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Credit/Debit Card
                                </TabsTrigger>
                                <TabsTrigger value="mpesa">
                                    <Smartphone className="mr-2 h-4 w-4" />
                                    M-Pesa
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="card" className="pt-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="card-name">Name on Card</Label>
                                        <Input id="card-name" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="card-number">Card Number</Label>
                                        <Input id="card-number" placeholder="**** **** **** 1234" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry">Expiry</Label>
                                            <Input id="expiry" placeholder="MM/YY" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvc">CVC</Label>
                                            <Input id="cvc" placeholder="123" />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                             <TabsContent value="mpesa" className="pt-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                                        <Input id="mpesa-phone" type="tel" placeholder="e.g. 0712345678" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        You will receive a prompt on your phone to enter your M-Pesa PIN to complete the payment.
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                     <div className="p-6 pt-0 flex justify-end">
                         <Button disabled>Pay & Upgrade</Button>
                    </div>
                </Card>
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
        </div>
    );
}
