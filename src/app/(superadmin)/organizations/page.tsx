
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Search, Loader } from "lucide-react";
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OrganizationData {
    organizationId: string;
    organizationName: string;
    subscriptionPlan: string;
    subscriptionStatus: 'Active' | 'Trialing' | 'Past Due' | 'Canceled' | 'Suspended';
    accountCreatedAt: string;
}

const statusVariantMap: { [key: string]: string } = {
    'Active': 'bg-green-100 text-green-800 border-green-200',
    'Suspended': 'bg-red-100 text-red-800 border-red-200',
    'Past Due': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const planVariantMap: { [key: string]: string } = {
    'Pro Plan': 'bg-gray-200 text-gray-800',
    'Enterprise Plan': 'bg-indigo-200 text-indigo-800',
    'Free Plan': 'bg-blue-200 text-blue-800',
}


export default function OrganizationsPage() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/superadmin/organizations', {
                    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}` }
                });
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                
                // Map API data to the card data structure, adding Suspended as a status for UI
                const mappedData = data.map((org: any) => ({
                    organizationId: org.organizationId,
                    organizationName: org.organizationName,
                    subscriptionPlan: org.subscriptionPlan || 'Free Plan',
                    subscriptionStatus: org.subscriptionStatus === 'Canceled' ? 'Suspended' : (org.subscriptionStatus || 'Active'),
                    accountCreatedAt: org.accountCreatedAt,
                }));
                setOrganizations(mappedData);

            } catch (error) {
                toast({ title: 'Error', description: 'Could not load organization data.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);


    const filteredOrgs = organizations.filter(org => 
        org.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Organizations"
                description="Browse and manage all organizations on the platform."
            />

            <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter by name..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex w-full sm:w-auto sm:ml-auto gap-2">
                    <Select>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="All Plans" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Plans</SelectItem>
                            <SelectItem value="free">Free Plan</SelectItem>
                            <SelectItem value="pro">Pro Plan</SelectItem>
                            <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrgs.map(org => {
                            const creationDate = new Date(org.accountCreatedAt);
                            const renewalDate = new Date(creationDate.setFullYear(creationDate.getFullYear() + 1));
                            return (
                                <Card 
                                    key={org.organizationId} 
                                    className="flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => router.push(`/organizations/${org.organizationId}`)}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg">{org.organizationName}</CardTitle>
                                            <Badge variant="outline" className={cn("font-medium capitalize", statusVariantMap[org.subscriptionStatus])}>
                                                {org.subscriptionStatus}
                                            </Badge>
                                        </div>
                                        <Badge variant="secondary" className={cn("w-fit", planVariantMap[org.subscriptionPlan])}>
                                            {org.subscriptionPlan}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="text-sm text-muted-foreground">
                                            <p>Billing cycle ends {isValid(renewalDate) ? formatDistanceToNow(renewalDate, { addSuffix: true }) : 'N/A'}</p>
                                            <p>Renews on {isValid(renewalDate) ? format(renewalDate, 'MMM d, yyyy') : 'N/A'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                    {filteredOrgs.length === 0 && (
                        <div className="text-center py-10 col-span-full">
                            <p className="text-muted-foreground">No organizations found matching your search.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
