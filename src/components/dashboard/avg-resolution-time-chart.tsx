
"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface AvgResolutionTimeChartProps {
    data: { name: string; hours: number | null }[];
}

export function AvgResolutionTimeChart({ data }: AvgResolutionTimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
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
          tickFormatter={(value) => `${value}h`}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          formatter={(value: number, name, props) => {
              if (value === null) return [null, null];
              return [`${value.toFixed(1)} hours`, "Avg. Time"]
          }}
        />
        <Line type="monotone" dataKey="hours" name="Avg. Resolution" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--chart-3))" }} activeDot={{ r: 6 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  )
}
