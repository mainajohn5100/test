
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign } from 'lucide-react';

export default function RevenuePage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Revenue"
        description="View earnings reports and financial metrics."
      />
      <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <DollarSign className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Earnings Reports</h2>
          <p className="text-muted-foreground mt-2">
            Detailed financial reports and revenue breakdowns will be displayed here.
          </p>
      </div>
    </div>
  );
}
