
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, AlertTriangle, CheckCircle2, Clock, Database, Server, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const MetricDisplay = ({ label, value, unit = '' }: { label: string, value: string, unit?: string }) => (
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
                <MetricDisplay label="P99 Latency" value="800" unit="ms" />
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
                <MetricDisplay label="Slow Queries (1h)" value="3" />
                <MetricDisplay label="Connections" value="45 / 100" />
                <MetricDisplay label="Read/Write Ratio" value="80 / 20" />
                <MetricDisplay label="Storage Usage" value="65.2" unit="GB" />
            </CardContent>
        </Card>
        
        {/* Request Flow & Usage */}
        <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center gap-3">
                <Activity className="h-6 w-6 text-orange-500"/>
                <div>
                    <CardTitle>Request Flow & Usage</CardTitle>
                    <CardDescription>Live traffic and user activity metrics.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0 p-0">
                 <MetricDisplay label="Requests per Second" value="150" unit="RPS" />
                 <MetricDisplay label="Concurrent Sessions" value="1,200" />
                 <MetricDisplay label="Failed Background Jobs (24h)" value="12" />
                 <div className="p-3 border-b md:border-b-0">
                    <p className="text-sm text-muted-foreground mb-1">Top Endpoints</p>
                    <p className="font-medium text-sm">/api/tickets</p>
                </div>
                 <div className="p-3 border-b md:border-b-0">
                    <p className="text-sm text-muted-foreground mb-1">Top Tenant (by Traffic)</p>
                    <p className="font-medium text-sm">Innovate Inc.</p>
                </div>
                 <div className="p-3">
                    <p className="text-sm text-muted-foreground mb-1">Traffic Distribution</p>
                    <p className="font-medium text-sm">US-East (60%), EU-West (30%)</p>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
