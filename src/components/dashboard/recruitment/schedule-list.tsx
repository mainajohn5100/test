
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Schedule } from "@/lib/data";

const categoryColors: { [key: string]: string } = {
    'Marketing': 'bg-green-100 text-green-800 border-green-200',
    'Human Resources': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Customer Support': 'bg-blue-100 text-blue-800 border-blue-200',
    'Finance': 'bg-indigo-100 text-indigo-800 border-indigo-200',
};


interface ScheduleListProps {
  schedule: Schedule[];
}

export function ScheduleList({ schedule }: ScheduleListProps) {
  return (
    <Card className="rounded-2xl border-none">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border"></div>
          {schedule.map(item => (
            <div key={item.id} className="relative flex items-start gap-4">
              <div className="absolute left-4 top-1 -translate-x-1/2 h-2 w-2 rounded-full bg-primary ring-4 ring-background"></div>
              <p className="w-16 text-sm text-muted-foreground text-right">{item.time}</p>
              <div className={`flex-1 p-3 rounded-lg border-l-4 ${categoryColors[item.category] || 'bg-gray-100 border-gray-200'}`}>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
