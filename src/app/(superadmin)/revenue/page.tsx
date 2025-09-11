
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign } from 'lucide-react';

export default function RevenuePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Revenue"
        description="View earnings reports and financial metrics."
      />
      <Card>
        <CardHeader>
          <CardTitle>Earnings Reports</CardTitle>
          <CardDescription>
            Detailed financial reports and revenue breakdowns will be displayed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Revenue reports are not yet available.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
