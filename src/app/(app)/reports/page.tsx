import { PageHeader } from "@/components/page-header";
import { ReportCharts } from "@/components/reports/charts";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" description="Analyze trends and performance with detailed reports.">
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Reports
        </Button>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download All
        </Button>
      </PageHeader>
      <ReportCharts />
    </div>
  );
}
