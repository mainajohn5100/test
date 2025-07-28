
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, Edit, Save, Plus } from 'lucide-react';
import { SLAPolicy, SLATarget } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

const priorityVariantMap: { [key: string]: string } = {
    'Urgent': 'text-red-700 border-red-500/50 bg-red-500/10',
    'High': 'text-orange-700 border-orange-500/50 bg-orange-500/10',
    'Medium': 'text-yellow-700 border-yellow-500/50 bg-yellow-500/10',
    'Low': 'text-green-700 border-green-500/50 bg-green-500/10',
};

function SLAPolicyRow({ target, onUpdate, isEditing }: { target: SLATarget, onUpdate: (priority: SLATarget['priority'], field: 'firstResponseHours' | 'resolutionHours', value: number) => void, isEditing: boolean }) {
    return (
        <TableRow>
            <TableCell>
                <Badge variant="outline" className={priorityVariantMap[target.priority]}>{target.priority}</Badge>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Input 
                        type="number"
                        value={target.firstResponseHours}
                        onChange={(e) => onUpdate(target.priority, 'firstResponseHours', parseInt(e.target.value, 10))}
                        disabled={!isEditing}
                        className="w-24 h-8"
                    />
                    <span className="text-muted-foreground">hours</span>
                </div>
            </TableCell>
            <TableCell>
                 <div className="flex items-center gap-2">
                    <Input 
                        type="number"
                        value={target.resolutionHours}
                        onChange={(e) => onUpdate(target.priority, 'resolutionHours', parseInt(e.target.value, 10))}
                        disabled={!isEditing}
                        className="w-24 h-8"
                    />
                    <span className="text-muted-foreground">hours</span>
                </div>
            </TableCell>
        </TableRow>
    )
}

export function SlaPoliciesForm() {
    const { slaPolicies, setSlaPolicies, loading } = useSettings();
    const { toast } = useToast();
    const [isSaving, startTransition] = React.useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [localPolicies, setLocalPolicies] = useState<SLAPolicy[]>([]);

    React.useEffect(() => {
        setLocalPolicies(JSON.parse(JSON.stringify(slaPolicies))); // Deep copy
    }, [slaPolicies, isEditing]);
    
    const handleTargetUpdate = (policyIndex: number, priority: SLATarget['priority'], field: 'firstResponseHours' | 'resolutionHours', value: number) => {
        const newPolicies = [...localPolicies];
        const policy = newPolicies[policyIndex];
        const target = policy.targets.find(t => t.priority === priority);
        if (target) {
            target[field] = value;
            setLocalPolicies(newPolicies);
        }
    };
    
    const handleSave = () => {
        startTransition(async () => {
            const success = await setSlaPolicies(localPolicies);
            if (success) {
                toast({ title: 'SLA Policies updated successfully.' });
                setIsEditing(false);
            } else {
                toast({ title: 'Error', description: 'Failed to update SLA policies.', variant: 'destructive' });
            }
        });
    }

    if (loading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>SLA Policies</CardTitle>
                    <CardDescription>
                        Set response and resolution time goals for your tickets.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-4">
                    <Loader className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>SLA Policies</CardTitle>
                <CardDescription>
                    Define response and resolution time goals for tickets based on their priority.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {localPolicies.map((policy, index) => (
                    <div key={policy.id}>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{policy.name}</h4>
                            {isEditing ? (
                                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                    Save
                                </Button>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4"/>
                                    Edit
                                </Button>
                            )}
                        </div>
                        <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>First Response Time</TableHead>
                                    <TableHead>Resolution Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {policy.targets.map(target => (
                                    <SLAPolicyRow 
                                        key={target.priority}
                                        target={target}
                                        isEditing={isEditing}
                                        onUpdate={(p, f, v) => handleTargetUpdate(index, p, f, v)}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
