
"use client"

import * as React from "react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart as BarChartIcon, LineChart as LineChartIcon } from "lucide-react"

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface TicketsOverviewChartProps {
    data: { name: string; value: number }[];
}

export function TicketsOverviewChart({ data }: TicketsOverviewChartProps) {
  const [chartType, setChartType] = React.useState<"bar" | "line">("bar");

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
            {chartType === 'bar' ? (
                <BarChart data={data}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      type="category"
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
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                       {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                       ))}
                    </Bar> 
                </BarChart>
            ) : (
                <LineChart data={data}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      type="category"
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
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--chart-2))" }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
            )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
