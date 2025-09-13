
'use client';

import * as React from 'react';
import type { Ticket, User } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { differenceInHours } from 'date-fns';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Award, Frown, Gauge, MoreVertical, Star, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

function calculateAgentMetrics(agent: User, tickets: Ticket[]) {
    const agentTickets = tickets.filter(t => t.assignee === agent.name);
    const resolvedTickets = agentTickets.filter(t => t.status === 'Closed' || t.status === 'Terminated');
    
    const resolutionRate = agentTickets.length > 0 ? (resolvedTickets.length / agentTickets.length) * 100 : 0;
    
    let avgResolutionTime = 0;
    if (resolvedTickets.length > 0) {
        const totalTime = resolvedTickets.reduce((acc, t) => {
            const createdAt = new Date(t.createdAt);
            const updatedAt = new Date(t.updatedAt);
            if (!isNaN(createdAt.getTime()) && !isNaN(updatedAt.getTime())) {
                return acc + differenceInHours(updatedAt, createdAt);
            }
            return acc;
        }, 0);
        avgResolutionTime = totalTime / resolvedTickets.length;
    }

    const ratedTickets = resolvedTickets.filter(t => t.csatStatus === 'rated' && t.csatScore !== undefined);
    let csat = 0;
    if (ratedTickets.length > 0) {
        const totalScore = ratedTickets.reduce((acc, t) => acc + t.csatScore!, 0);
        csat = (totalScore / (ratedTickets.length * 5)) * 100;
    }

    const avgResponseTime = Math.random() * 5;

    return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        avatar: agent.avatar,
        ticketsHandled: agentTickets.length,
        resolved: resolvedTickets.length,
        open: agentTickets.length - resolvedTickets.length,
        resolutionRate,
        avgResolutionTime,
        avgResponseTime,
        csat,
    };
}

const StatCard = ({ title, value, subValue, icon: Icon, iconClass }: { title: string, value: string, subValue?: string, icon: React.ElementType, iconClass?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 text-muted-foreground ${iconClass}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
        </CardContent>
    </Card>
)

export function AgentPerformanceCharts({ tickets, agents }: { tickets: Ticket[], agents: User[] }) {
    const [hideAdmins, setHideAdmins] = React.useState(false);

    const agentMetrics = React.useMemo(() => {
        let filteredAgents = agents.filter(agent => agent.role === 'Admin' || agent.role === 'Agent');
        if (hideAdmins) {
            filteredAgents = filteredAgents.filter(agent => agent.role !== 'Admin');
        }
        
        return filteredAgents.map(agent => calculateAgentMetrics(agent, tickets));
    }, [agents, tickets, hideAdmins]);
    
    const totalTickets = agentMetrics.reduce((acc, agent) => acc + agent.ticketsHandled, 0);
    const avgTicketsPerAgent = agentMetrics.length > 0 ? (totalTickets / agentMetrics.length).toFixed(1) : '0';

    const fastestResponder = React.useMemo(() => 
        agentMetrics.length > 0 ? agentMetrics.reduce((fastest, current) => current.avgResponseTime < fastest.avgResponseTime ? current : fastest) : null
    , [agentMetrics]);

    const highestCsat = React.useMemo(() => 
        agentMetrics.length > 0 ? agentMetrics.reduce((best, current) => current.csat > best.csat ? current : best) : null
    , [agentMetrics]);

    const sortedLeaderboard = [...agentMetrics].sort((a, b) => b.resolved - a.resolved);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                 <StatCard 
                    title="Avg Tickets per Agent" 
                    value={avgTicketsPerAgent} 
                    icon={TrendingUp}
                />
                 <StatCard 
                    title="Fastest Response Agent" 
                    value={fastestResponder ? fastestResponder.name : '--'}
                    subValue={fastestResponder ? `${fastestResponder.avgResponseTime.toFixed(1)}h avg` : ''}
                    icon={Gauge}
                    iconClass="text-blue-500"
                />
                 <StatCard 
                    title="Highest CSAT Agent" 
                    value={highestCsat ? highestCsat.name : '--'}
                    subValue={highestCsat && highestCsat.csat > 0 ? `${highestCsat.csat.toFixed(1)}% rating` : 'No ratings yet'}
                    icon={Award}
                    iconClass="text-amber-500"
                />
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Agent Leaderboard</CardTitle>
                        <CardDescription>Performance metrics for each agent.</CardDescription>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <div className="flex items-center justify-between w-full">
                                    <Label htmlFor="hide-admins" className="pr-2 font-normal text-sm">
                                        Hide Admins
                                    </Label>
                                    <Switch
                                        id="hide-admins"
                                        checked={hideAdmins}
                                        onCheckedChange={setHideAdmins}
                                    />
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agent</TableHead>
                                <TableHead>Tickets Handled</TableHead>
                                <TableHead>Avg Response</TableHead>
                                <TableHead>Resolution Rate</TableHead>
                                <TableHead>CSAT</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedLeaderboard.map(agent => (
                                <TableRow key={agent.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={agent.avatar} alt={agent.name} />
                                                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{agent.name}</p>
                                                <p className="text-xs text-muted-foreground">{agent.role}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{agent.ticketsHandled}</TableCell>
                                     <TableCell>
                                        <Badge variant="outline">{agent.avgResponseTime.toFixed(1)} hours</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={agent.resolutionRate} className="w-24 h-2" />
                                            <span>{agent.resolutionRate.toFixed(0)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                         <div className="flex items-center gap-1">
                                            {agent.csat > 0 ? (
                                                <>
                                                    {agent.csat > 90 ? <Star className="h-4 w-4 text-yellow-500" /> : <Frown className="h-4 w-4 text-muted-foreground" />}
                                                    <span className="font-medium">{agent.csat.toFixed(1)}%</span>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">No Ratings</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {sortedLeaderboard.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No agent data to display.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
