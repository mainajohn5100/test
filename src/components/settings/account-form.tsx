
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { KeyRound, ShieldCheck, Loader } from 'lucide-react';
import { EditProfileForm } from './edit-profile-form';
import { format } from 'date-fns';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';
import { updateUserPrivacyAction } from '@/app/(app)/users/actions';

export function AccountForm() {
    const { user, loading, refreshUser } = useAuth();
    const { toast } = useToast();
    const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
    const [isUpdatingPrivacy, startPrivacyTransition] = React.useTransition();

    const handleOpenChange = (open: boolean) => {
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
                    <Dialog open={isEditDialogOpen} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">Edit Profile</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
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
             <div className="lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Additional details about your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><code>{user.id}</code></div>
                        </div>

                        {(user.phone || user.gender || user.dob) && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    {user.phone && (<div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{user.phone}</span></div>)}
                                    {user.gender && (<div className="flex justify-between"><span className="text-muted-foreground">Gender</span><span>{user.gender}</span></div>)}
                                    {user.dob && (<div className="flex justify-between"><span className="text-muted-foreground">Birthday</span><span>{format(new Date(user.dob), "PPP")}</span></div>)}
                                </div>
                            </>
                        )}
                        
                        {(user.city || user.country || user.zipCode) && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    {user.city && (<div className="flex justify-between"><span className="text-muted-foreground">City</span><span>{user.city}</span></div>)}
                                    {user.country && (<div className="flex justify-between"><span className="text-muted-foreground">Country</span><span>{user.country}</span></div>)}
                                    {user.zipCode && (<div className="flex justify-between"><span className="text-muted-foreground">Zip Code</span><span>{user.zipCode}</span></div>)}
                                </div>
                            </>
                        )}

                        {!user.phone && !user.country && !user.city && !user.zipCode && !user.dob && !user.gender && (
                            <>
                                <Separator />
                                <p className="text-muted-foreground text-center py-8">No additional information provided. Edit your profile to add more details.</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Privacy Settings</CardTitle>
                        <CardDescription>Manage your public profile visibility.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
             </div>
        </div>
    );
}
