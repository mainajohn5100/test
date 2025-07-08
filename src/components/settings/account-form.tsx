
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { KeyRound, ShieldCheck, Loader } from 'lucide-react';
import { EditProfileForm } from './edit-profile-form';

export function AccountForm() {
    const { user, loading, refreshUser } = useAuth();
    const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);

    const handleOpenChange = (open: boolean) => {
        setEditDialogOpen(open);
        if (!open) {
            refreshUser();
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>
                        Manage your account settings and set e-mail preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-10">
                    <Loader className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }
    
    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>
                        No user is currently logged in.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                  <Dialog open={isEditDialogOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">Edit Profile</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <EditProfileForm user={user} setOpen={setEditDialogOpen} />
                    </DialogContent>
                  </Dialog>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage account security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline" disabled>
                        <KeyRound className="mr-2"/>
                        Change Password
                    </Button>
                    <Button className="w-full" variant="outline" disabled>
                        <ShieldCheck className="mr-2"/>
                        Enable Two-Factor Auth
                    </Button>
                    <p className="text-xs text-muted-foreground text-center pt-2">SSO/OAuth settings would appear here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
