
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Briefcase, Search } from "lucide-react";
import { Input } from '@/components/ui/input';

// Placeholder data - this would come from an API call in a real app
const placeholderOrgs = [
  { id: '1', name: 'Innovate Inc.', logoUrl: undefined, userCount: 15, projectCount: 5 },
  { id: '2', name: 'Solutions Corp', logoUrl: undefined, userCount: 25, projectCount: 12 },
  { id: '3', name: 'Synergy Group', logoUrl: undefined, userCount: 8, projectCount: 2 },
  { id: '4', name: 'QuantumLeap', logoUrl: undefined, userCount: 50, projectCount: 20 },
  { id: '5', name: 'NextGen Ventures', logoUrl: undefined, userCount: 10, projectCount: 7 },
  { id: '6', name: 'Apex Enterprises', logoUrl: undefined, userCount: 3, projectCount: 1 },
];

export default function OrganizationsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrgs = placeholderOrgs.filter(org => 
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOrgs.map(org => (
                    <Card key={org.id} className="flex flex-col hover:shadow-lg transition-shadow">
                        <CardHeader className="flex-row items-center gap-4">
                            <Avatar>
                                <AvatarImage src={org.logoUrl} alt={org.name} />
                                <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="truncate">
                                <CardTitle className="truncate">{org.name}</CardTitle>
                                <CardDescription>ID: {org.id}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{org.userCount} Users</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    <span>{org.projectCount} Projects</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="outline" onClick={() => router.push(`/superadmin/organizations/${org.id}`)}>
                                Manage Organization
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
             {filteredOrgs.length === 0 && (
                <div className="text-center py-10 col-span-full">
                    <p className="text-muted-foreground">No organizations found matching your search.</p>
                </div>
            )}
        </div>
    )
}
