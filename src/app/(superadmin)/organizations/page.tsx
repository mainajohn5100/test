
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Briefcase, Search, Loader } from "lucide-react";
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';

interface OrganizationData {
    organizationId: string;
    organizationName: string;
    organizationLogoUrl?: string;
    userCounts: { admins: number, agents: number, clients: number };
    projectCount: number;
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
                setOrganizations(data);
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

            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search organizations..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredOrgs.map(org => {
                            const totalUsers = org.userCounts.admins + org.userCounts.agents + org.userCounts.clients;
                            return (
                                <Card key={org.organizationId} className="flex flex-col hover:shadow-lg transition-shadow">
                                    <CardHeader className="flex-row items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={org.organizationLogoUrl} alt={org.organizationName} />
                                            <AvatarFallback>{org.organizationName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="truncate">
                                            <CardTitle className="truncate">{org.organizationName}</CardTitle>
                                            <CardDescription>ID: {org.organizationId.substring(0, 8)}...</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-4">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>{totalUsers} Users</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                <span>{org.projectCount} Projects</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" variant="outline" onClick={() => router.push(`/superadmin/organizations/${org.organizationId}`)}>
                                            Manage Organization
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </CardFooter>
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
