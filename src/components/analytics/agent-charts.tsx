
'use client';

import * as React from 'react';
import type { Ticket, User } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { differenceInHours } from 'date-fns';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

function calculateAgentMetrics(agent: User, tickets: Ticket[]) {
    const agentTickets = tickets.filter(t => t.assignee === agent.name);
    const resolvedTickets = agentTickets.filter(t => t.status === 'Closed' || t.status === 'Terminated');
    
    const resolutionRate = agentTickets.length > 0 ? (resolvedTickets.length / agentTickets.length) * 100 : 0;
    
    let avgResolutionTime = 0;
    if (resolvedTickets.length > 0) {
        const totalTime = resolvedTickets.reduce((acc, t) => {
            return acc + differenceInHours(new Date(t.updatedAt), new Date(t.createdAt));
        }, 0);
        avgResolutionTime = totalTime / resolvedTickets.length;
    }

    return {
        id: agent.id,
        name: agent.name,
        avatar: agent.avatar,
        ticketsHandled: agentTickets.length,
        resolved: resolvedTickets.length,
        open: agentTickets.length - resolvedTickets.length,
        resolutionRate,
        avgResolutionTime,
    };
}

export function AgentPerformanceCharts({ tickets, agents }: { tickets: Ticket[], agents: User[] }) {
    const agentMetrics = React.useMemo(() => {
        return agents.map(agent => calculateAgentMetrics(agent, tickets))
                     .sort((a, b) => b.resolved - a.resolved); // Sort by most resolved tickets
    }, [agents, tickets]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Agent Leaderboard</CardTitle>
                <CardDescription>Performance metrics for each agent.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Agent</TableHead>
                            <TableHead>Tickets Handled</TableHead>
                            <TableHead>Resolution Rate</TableHead>
                            <TableHead>Avg. Resolution Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agentMetrics.map(agent => (
                            <TableRow key={agent.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={agent.avatar} alt={agent.name} />
                                            <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{agent.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{agent.ticketsHandled}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Progress value={agent.resolutionRate} className="w-24 h-2" />
                                        <span>{agent.resolutionRate.toFixed(0)}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{agent.avgResolutionTime.toFixed(1)} hours</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
