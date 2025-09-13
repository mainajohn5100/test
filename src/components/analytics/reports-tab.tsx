
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, Mail } from 'lucide-react';
import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

export function ReportsTab() {
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: addDays(new Date(), -30),
      to: new Date(),
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Export Reports</CardTitle>
                    <CardDescription>Download ticket and performance data as a CSV file.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                    <DateRangePicker date={date} setDate={setDate} />
                    <Button disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Export Ticket Data (CSV)
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Scheduled Reports</CardTitle>
                    <CardDescription>
                        Automatically receive performance reports via email. (Coming Soon)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/50">
                        <div className="text-center text-muted-foreground">
                            <Mail className="mx-auto h-8 w-8 mb-2" />
                            <p>Set up weekly or monthly email digests.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
