"use client"

import * as React from "react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { pieChartData } from "@/lib/data"
import { BarChart as BarChartIcon, LineChart as LineChartIcon } from "lucide-react"

export function TicketsOverviewChart() {
  const [chartType, setChartType] = React.useState<"bar" | "line">("bar");

  const ChartComponent = chartType === 'bar' ? BarChart : LineChart;
  const ChartElement = chartType === 'bar' 
    ? <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="var(--chart-2)" /> 
    : <Line type="monotone" dataKey="value" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 4, fill: "var(--chart-2)" }} activeDot={{ r: 6 }} />;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Tickets by Status</CardTitle>
        <div className="flex items-center gap-2">
            <Button
                size="icon"
                variant={chartType === 'bar' ? 'secondary' : 'ghost'}
                onClick={() => setChartType('bar')}
                className="h-8 w-8"
            >
                <BarChartIcon className="h-4 w-4" />
                <span className="sr-only">Bar Chart</span>
            </Button>
            <Button
                size="icon"
                variant={chartType === 'line' ? 'secondary' : 'ghost'}
                onClick={() => setChartType('line')}
                className="h-8 w-8"
            >
                <LineChartIcon className="h-4 w-4" />
                <span className="sr-only">Line Chart</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={250}>
          <ChartComponent data={pieChartData}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            {ChartElement}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
