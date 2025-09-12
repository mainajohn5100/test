

'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Loader, ShieldAlert, Users, Building, LinkIcon, Save, Image as ImageIcon, Globe, CreditCard, User, Wifi, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrganizationById, getUsers } from '@/lib/firestore';
import type { Organization, User as UserType } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { updateOrganizationAction } from '../actions';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function OrgDetailsCard({ org, onSave }: { org: Organization, onSave: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = React.useTransition();
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(org.logo || null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(async () => {
            const formData = new FormData(event.currentTarget);
            const result = await updateOrganizationAction(org.id, formData);
            if (result.success) {
                toast({ title: "Organization Updated", description: result.message });
                onSave();
            } else {
                toast({ title: "Error", description: result.error, variant: 'destructive' });
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Update your organization's branding and domain settings.</CardDescription>
            </CardHeader>
            <CardContent>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded-md">
                            <AvatarImage src={previewUrl || undefined} className="object-contain" />
                            <AvatarFallback className="rounded-md">
                                <Building />
                            </AvatarFallback>
                        </Avatar>
                        <div className="w-full">
                            <Label htmlFor="logo">Organization Logo</Label>
                            <Input 
                                id="logo"
                                name="logo"
                                type="file" 
                                className="mt-1" 
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleFileChange}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input id="name" name="name" defaultValue={org.name} disabled={isPending} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="domain">Custom Domain (Optional)</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="domain" name="domain" placeholder="example.com" defaultValue={org.domain} className="pl-9" disabled={isPending} />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function TeamCard({ users }: { users: UserType[] }) {
    const router = useRouter();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>An overview of the users in your organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {users.slice(0, 4).map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/users/${user.id}`)}>
                            <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                    </div>
                ))}
                {users.length > 4 && (
                    <p className="text-sm text-center text-muted-foreground pt-2">
                        + {users.length - 4} more members
                    </p>
                )}
                 <Button variant="outline" className="w-full" onClick={() => router.push('/users')}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage All Users
                </Button>
            </CardContent>
        </Card>
    );
}

function BillingCard({ org }: { org: Organization }) {
    const plan = org.settings?.subscriptionPlan || 'Free';
    const status = org.settings?.subscriptionStatus || 'Active';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Your current plan and billing status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-semibold">{plan} Plan</p>
                        <p className="text-sm text-muted-foreground">Next billing date: N/A</p>
                    </div>
                    <Badge variant={status === 'Active' ? 'default' : 'destructive'} className={status === 'Active' ? 'bg-green-600' : ''}>
                        {status}
                    </Badge>
                </div>
                 <Button variant="secondary" className="w-full" disabled>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Billing
                </Button>
            </CardContent>
        </Card>
    )
}

function ActivityCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Live status of your organization's services.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center pt-6">
                <div className="flex items-center gap-4 text-green-600">
                    <div className="relative flex h-6 w-6">
                        <Wifi className="relative h-6 w-6" />
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    </div>
                    <span className="font-semibold text-lg">All Systems Online</span>
                </div>
            </CardContent>
        </Card>
    )
}

export default function OrganizationPage() {
    const { user, loading: authLoading } = useAuth();
    const [organization, setOrganization] = React.useState<Organization | null>(null);
    const [users, setUsers] = React.useState<UserType[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshKey, setRefreshKey] = React.useState(0);

    React.useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setLoading(true);
                const [orgData, usersData] = await Promise.all([
                    getOrganizationById(user.organizationId),
                    getUsers(user)
                ]);
                setOrganization(orgData);
                setUsers(usersData);
                setLoading(false);
            };
            fetchData();
        }
    }, [user, refreshKey]);

    const pageLoading = authLoading || loading;
    
    if (pageLoading) {
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
    
    if (!organization) {
        return <p>Organization not found.</p>;
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Organization Dashboard"
                description={`Welcome to the management center for ${organization.name}.`}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <OrgDetailsCard org={organization} onSave={() => setRefreshKey(k => k + 1)} />
                    <ActivityCard />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <TeamCard users={users} />
                    <BillingCard org={organization} />
                </div>
            </div>
        </div>
    );
}
