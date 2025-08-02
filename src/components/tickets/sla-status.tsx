
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { Ticket } from '@/lib/data';
import { differenceInSeconds, intervalToDuration } from 'date-fns';

interface SlaStatusProps {
  ticket: Ticket;
}

const formatDuration = (totalSeconds: number) => {
  if (totalSeconds <= 0) return '00:00:00';
  const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 });
  const d = duration.days || 0;
  const h = (duration.hours || 0).toString().padStart(2, '0');
  const m = (duration.minutes || 0).toString().padStart(2, '0');
  const s = (duration.seconds || 0).toString().padStart(2, '0');
  return d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`;
};

const getStatusInfo = (seconds: number, type: 'Response' | 'Resolution') => {
  if (seconds < 0) {
    return { status: 'Breached', color: 'bg-red-100 text-red-800 border-red-200' };
  }
  const hours = seconds / 3600;
  if (hours < 1) {
    return { status: 'At Risk', color: 'bg-orange-100 text-orange-800 border-orange-200' };
  }
  return { status: 'On Track', color: 'bg-green-100 text-green-800 border-green-200' };
};

export function SlaStatus({ ticket }: SlaStatusProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isTicketActive = ticket.status === 'Active' || ticket.status === 'New' || ticket.status === 'Pending';
  const isSlaApplicable = ticket.firstResponseDue && ticket.resolutionDue && isTicketActive;

  if (!isSlaApplicable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SLA Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active SLA on this ticket.</p>
        </CardContent>
      </Card>
    );
  }

  const firstResponseDueDate = new Date(ticket.firstResponseDue!);
  const resolutionDueDate = new Date(ticket.resolutionDue!);

  const secondsToFirstResponse = differenceInSeconds(firstResponseDueDate, now);
  const secondsToResolution = differenceInSeconds(resolutionDueDate, now);

  const firstResponseStatus = getStatusInfo(secondsToFirstResponse, 'Response');
  const resolutionStatus = getStatusInfo(secondsToResolution, 'Resolution');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm font-medium">Next Reply Due</p>
                <p className="text-lg font-mono font-semibold">{formatDuration(secondsToFirstResponse)}</p>
            </div>
            <Badge className={firstResponseStatus.color}>{firstResponseStatus.status}</Badge>
        </div>
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm font-medium">Resolution Due</p>
                <p className="text-lg font-mono font-semibold">{formatDuration(secondsToResolution)}</p>
            </div>
            <Badge className={resolutionStatus.color}>{resolutionStatus.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
