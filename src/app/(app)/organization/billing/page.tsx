
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, Smartphone, Loader } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

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

function UpgradeDialog() {
    const { toast } = useToast();
    const [isPending, startTransition] = React.useTransition();
    const [activeTab, setActiveTab] = React.useState('mpesa');
    const [mpesaPhone, setMpesaPhone] = React.useState('');

    const handleUpgrade = () => {
        if (activeTab === 'mpesa' && !mpesaPhone.trim()) {
            toast({
                title: 'Phone Number Required',
                description: 'Please enter your M-Pesa phone number.',
                variant: 'destructive',
            });
            return;
        }

        startTransition(async () => {
            try {
                const response = await fetch('/api/billing/initiate-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        plan: 'Pro',
                        paymentMethod: activeTab,
                        phone: mpesaPhone,
                    }),
                });

                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to initiate payment.');
                }
                
                if (result.redirectUrl) {
                    window.location.href = result.redirectUrl;
                } else {
                    throw new Error('Could not retrieve payment URL.');
                }

            } catch (error: any) {
                toast({
                    title: 'Payment Error',
                    description: error.message,
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full">Upgrade to Pro</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upgrade to Pro Plan</DialogTitle>
                    <DialogDescription>
                        Select your preferred payment method to complete the upgrade. You will be redirected to our secure payment partner.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                     <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="mpesa">
                                <Smartphone className="mr-2 h-4 w-4" />
                                M-Pesa
                            </TabsTrigger>
                            <TabsTrigger value="card">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Credit/Debit Card
                            </TabsTrigger>
                        </TabsList>
                         <TabsContent value="mpesa" className="pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                                <Input id="mpesa-phone" type="tel" placeholder="e.g. 0712345678" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} />
                            </div>
                        </TabsContent>
                        <TabsContent value="card" className="pt-6">
                            <div className="text-sm text-muted-foreground">
                                You will be redirected to our secure payment partner, Pesapal, to enter your card details and complete the payment.
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost" disabled={isPending}>Cancel</Button></DialogClose>
                    <Button onClick={handleUpgrade} disabled={isPending}>
                        {isPending && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
                        Pay & Upgrade
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

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
                                {plan.isPopular && <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">Most Popular</span>}
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
                            {plan.name === 'Pro' ? (
                                <UpgradeDialog />
                            ) : (
                                 <Button className="w-full" disabled={plan.isCurrent}>
                                    {plan.cta}
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1">
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
