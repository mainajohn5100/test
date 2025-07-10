
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Loader } from 'lucide-react';
import { EditProfileForm } from './edit-profile-form';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';
import { updateUserPrivacyAction } from '@/app/(app)/users/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useSettings } from '@/contexts/settings-context';

export function AccountForm() {
    const { user, loading, refreshUser } = useAuth();
    const { 
        inactivityTimeout, 
        setInactivityTimeout, 
        INACTIVITY_TIMEOUT_OPTIONS 
    } = useSettings();
    const { toast } = useToast();
    const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
    const [isUpdatingPrivacy, startPrivacyTransition] = React.useTransition();

    const handleEditDialogChange = (open: boolean) => {
        setEditDialogOpen(open);
        if (!open) {
            refreshUser();
        }
    }
    
    const handlePrivacyChange = (isPublic: boolean) => {
        if (!user) return;
        startPrivacyTransition(async () => {
            const result = await updateUserPrivacyAction(user.id, isPublic);
            if (result.success) {
                toast({ title: "Privacy settings updated!" });
                await refreshUser(); // Refresh user context to get new privacy setting
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        });
    };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
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
                    <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
                        <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">Edit Profile & Security</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <EditProfileForm user={user} setOpen={setEditDialogOpen} />
                        </DialogContent>
                    </Dialog>
                    </CardContent>
                </Card>
            </div>
             <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Settings</CardTitle>
                        <CardDescription>Manage your public profile visibility and session preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="public-activity" className="text-base">
                                Public Activity
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                Allow others to see your tickets and projects.
                                </p>
                            </div>
                            <Switch
                                id="public-activity"
                                checked={user.activityIsPublic}
                                onCheckedChange={handlePrivacyChange}
                                disabled={isUpdatingPrivacy}
                                aria-label="Toggle public activity"
                            />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="inactivity-timeout" className="text-base">
                                Inactivity Timeout
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                Automatically log out after a period of inactivity.
                                </p>
                            </div>
                             <Select 
                                value={String(inactivityTimeout)} 
                                onValueChange={(value) => setInactivityTimeout(Number(value))}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select timeout" />
                                </SelectTrigger>
                                <SelectContent>
                                    {INACTIVITY_TIMEOUT_OPTIONS.map(option => (
                                        <SelectItem key={option.value} value={String(option.value)}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
             </div>
        </div>
    );
}
