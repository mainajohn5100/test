
'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, CheckCircle, Users, Briefcase, Loader, Search, MoreVertical, Eye, DollarSign } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isValid } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';

interface OrganizationData {
    organizationId: string;
    organizationName: string;
    organizationLogoUrl?: string;
    subscriptionStatus: 'Active' | 'Trialing' | 'Past Due' | 'Canceled';
    accountCreatedAt: string; // ISO string
    userCounts: { admins: number, agents: number, clients: number };
    projectCount: number;
}

function RecentActivityTable({ organizations }: { organizations: OrganizationData[] }) {
    const router = useRouter();

    const billingStatusVariant: Record<OrganizationData['subscriptionStatus'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
        'Active': 'default',
        'Trialing': 'secondary',
        'Past Due': 'destructive',
        'Canceled': 'outline'
    };
    
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Projects</TableHead>
                        <TableHead>Billing Status</TableHead>
                        <TableHead>Date Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {organizations.map(org => {
                         const creationDate = new Date(org.accountCreatedAt);
                         const totalUsers = org.userCounts.admins + org.userCounts.agents + org.userCounts.clients;
                        return (
                        <TableRow key={org.organizationId} onClick={() => router.push(`/superadmin/organizations/${org.organizationId}`)} className="cursor-pointer">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={org.organizationLogoUrl} alt={org.organizationName} />
                                        <AvatarFallback>{org.organizationName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{org.organizationName}</span>
                                </div>
                            </TableCell>
                            <TableCell>{totalUsers}</TableCell>
                            <TableCell>{org.projectCount}</TableCell>
                            <TableCell>
                                <Badge variant={billingStatusVariant[org.subscriptionStatus]}>{org.subscriptionStatus}</Badge>
                            </TableCell>
                            <TableCell>{isValid(creationDate) ? format(creationDate, 'PP') : 'N/A'}</TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
        </div>
    );
}

export default function SuperAdminDashboardPage() {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
    const [revenueTimeframe, setRevenueTimeframe] = useState('monthly');
    
    useEffect(() => {
        if (!currentUser) return;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                // In a real app, this secret would be an ID token.
                const response = await fetch('/api/superadmin/organizations', {
                    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}` }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch organizations: ${response.statusText}`);
                }
                const data: OrganizationData[] = await response.json();
                setOrganizations(data);
            } catch (error) {
                console.error(error);
                toast({ title: 'Error', description: 'Could not load organization data.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const totalUsers = organizations.reduce((acc, org) => acc + (org.userCounts.admins + org.userCounts.agents + org.userCounts.clients), 0);
    const totalProjects = organizations.reduce((acc, org) => acc + org.projectCount, 0);
    const activeSubscriptions = organizations.filter(org => org.subscriptionStatus === 'Active').length;

    // Placeholder revenue data
    const revenueData: { [key: string]: number } = {
      daily: 125.50,
      weekly: 875.00,
      monthly: 3500.00,
      yearly: 42000.00,
    };
    const totalRevenue = revenueData[revenueTimeframe];

    const statCards = [
        { title: "Total Organizations", value: organizations.length, icon: Building, description: "All organizations on the platform" },
        { title: "Active Subscriptions", value: activeSubscriptions, icon: CheckCircle, description: "Organizations with an active plan" },
        { title: "Total Projects", value: totalProjects, icon: Briefcase, description: "Sum of all projects created" },
        { title: "Total Users", value: totalUsers, icon: Users, description: "Total registered users" },
    ];

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Dashboard"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map(card => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.title}
                            </CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             {loading ? (
                                <>
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-4 w-32 mt-2" />
                                </>
                             ) : (
                                <>
                                    <div className="text-2xl font-bold">{card.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {card.description}
                                    </p>
                                </>
                             )}
                        </CardContent>
                    </Card>
                ))}
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <Select value={revenueTimeframe} onValueChange={setRevenueTimeframe}>
                          <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-1 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="end">
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <>
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-4 w-20 mt-2" />
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {revenueTimeframe.charAt(0).toUpperCase() + revenueTimeframe.slice(1)} revenue
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
             <div className="grid grid-cols-1">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>All Organizations</CardTitle>
                                <CardDescription>
                                    A list of all organizations on the platform.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                             <div className="flex h-40 items-center justify-center">
                                <Loader className="h-6 w-6 animate-spin" />
                             </div>
                        ) : (
                            <RecentActivityTable organizations={organizations} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
