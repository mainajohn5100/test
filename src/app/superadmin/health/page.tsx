
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, AlertTriangle, CheckCircle2, Clock, Database, Server, Zap, Cpu, Network, Users, Shield, Thermometer, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const MetricDisplay = ({ label, value, unit = '' }: { label: string, value: string | number, unit?: string }) => (
    <div className="flex justify-between items-center text-sm p-3 border-b last:border-b-0">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium">{value} <span className="text-xs text-muted-foreground">{unit}</span></p>
    </div>
);

const ServiceStatus = ({ name, status }: { name: string, status: 'Online' | 'Offline' | 'Degraded' }) => {
    const statusMap = {
        Online: { icon: CheckCircle2, color: 'text-green-500' },
        Offline: { icon: AlertTriangle, color: 'text-destructive' },
        Degraded: { icon: AlertTriangle, color: 'text-orange-500' },
    };
    const { icon: Icon, color } = statusMap[status];

    return (
        <div className="flex justify-between items-center text-sm p-3 border-b last:border-b-0">
            <p>{name}</p>
            <Badge variant="outline" className={`flex items-center gap-1.5 text-xs ${color} border-current/50 bg-current/10`}>
                <Icon className="h-3 w-3" />
                {status}
            </Badge>
        </div>
    )
};


export default function SystemHealthPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System Health"
        description="Live metrics and status for the RequestFlow application."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Health */}
        <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-3">
                <Server className="h-6 w-6 text-blue-500"/>
                <div>
                    <CardTitle>Application Health</CardTitle>
                    <CardDescription>Core service performance.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <MetricDisplay label="Uptime (24h)" value="99.98" unit="%" />
                <MetricDisplay label="Error Rate (1h)" value="0.02" unit="%" />
                <MetricDisplay label="Avg. Latency" value="120" unit="ms" />
                <MetricDisplay label="P95 Latency" value="450" unit="ms" />
                <MetricDisplay label="Background Jobs Failed" value={3} />
            </CardContent>
        </Card>

         {/* API Status */}
        <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-3">
                <Zap className="h-6 w-6 text-green-500"/>
                <div>
                    <CardTitle>API & Service Status</CardTitle>
                    <CardDescription>Real-time endpoint health.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ServiceStatus name="Authentication" status="Online" />
                <ServiceStatus name="Ticketing API" status="Online" />
                <ServiceStatus name="Billing Service" status="Online" />
                <ServiceStatus name="Email Service" status="Degraded" />
                <ServiceStatus name="Background Jobs" status="Online" />
            </CardContent>
        </Card>

         {/* Database Health */}
        <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-3">
                <Database className="h-6 w-6 text-purple-500"/>
                <div>
                    <CardTitle>Database Health</CardTitle>
                    <CardDescription>Metrics for the primary database.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <MetricDisplay label="Avg. Query Time" value="8" unit="ms" />
                <MetricDisplay label="Connections" value="45 / 100" />
                <MetricDisplay label="Read/Write Ratio" value="80 / 20" />
                <MetricDisplay label="Storage Usage" value="65.2" unit="GB" />
                <MetricDisplay label="Slow Queries (1h)" value="3" />
            </CardContent>
        </Card>
        
        {/* Infrastructure */}
         <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-3">
                <Cpu className="h-6 w-6 text-gray-500"/>
                <div>
                    <CardTitle>Infrastructure</CardTitle>
                    <CardDescription>Server and resource metrics.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <MetricDisplay label="Avg. CPU Usage" value="35" unit="%" />
                <MetricDisplay label="Memory Usage" value="7.8 / 16" unit="GB" />
                <MetricDisplay label="Network I/O" value="1.2" unit="Gbps" />
                <MetricDisplay label="Cache Hit Ratio" value="98.2" unit="%" />
                <ServiceStatus name="Server Status" status="Online" />
            </CardContent>
        </Card>
        
        {/* Tenant Metrics */}
         <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-3">
                <Users className="h-6 w-6 text-cyan-500"/>
                <div>
                    <CardTitle>Tenant Metrics</CardTitle>
                    <CardDescription>SaaS-specific health indicators.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <MetricDisplay label="Active vs Inactive" value="152 / 18" />
                <MetricDisplay label="SLA Compliance" value="99.2" unit="%" />
                <MetricDisplay label="Avg. Ticket Backlog" value="12" />
                <MetricDisplay label="High Load Tenants" value="3" />
                <MetricDisplay label="Top Tenant by Errors" value="Innovate Inc." />
            </CardContent>
        </Card>
        
        {/* Security & Reliability */}
         <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-3">
                <Shield className="h-6 w-6 text-red-500"/>
                <div>
                    <CardTitle>Security & Reliability</CardTitle>
                    <CardDescription>Auth failures and system alerts.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <MetricDisplay label="Failed Logins (1h)" value="1,289" />
                <MetricDisplay label="Rate Limits Triggered" value="45" />
                <MetricDisplay label="Invalid API Keys Used" value="12" />
                <MetricDisplay label="Replication Lag" value="2" unit="s" />
                <ServiceStatus name="Audit Logs" status="Online" />
            </CardContent>
        </Card>

        {/* Visualizations Section */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <Card>
                <CardHeader>
                    <CardTitle>Request Latency</CardTitle>
                    <CardDescription>Latency over time.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-40">
                    <BarChart className="h-28 w-28 text-muted-foreground" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>SLA Compliance</CardTitle>
                    <CardDescription>Gauge of tickets within SLA.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-40">
                    <div className="relative h-24 w-24">
                        <svg className="h-full w-full" viewBox="0 0 36 36">
                            <path className="text-muted/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="99.2, 100" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">99.2%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Error Rate by Endpoint</CardTitle>
                    <CardDescription>Heatmap of endpoint failures.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-40">
                    <Thermometer className="h-28 w-28 text-muted-foreground" />
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}

    