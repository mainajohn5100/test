
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import type { Task } from "@/lib/data";
import { format } from "date-fns";

interface TasksListProps {
  tasks: Task[];
}

export function TasksList({ tasks }: TasksListProps) {
  return (
    <Card className="rounded-2xl border-none">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Tasks</CardTitle>
        <Button size="icon" className="bg-green-100 hover:bg-green-200 text-green-700 rounded-lg">
            <Plus className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 dark:bg-muted/20">
                <div className="w-16">
                    <div className="relative h-12 w-12">
                        <svg className="h-full w-full" viewBox="0 0 36 36">
                            <path
                                className="stroke-current text-gray-200 dark:text-gray-700"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                strokeWidth="3"
                            />
                            <path
                                className="stroke-current text-indigo-500"
                                strokeDasharray={`${task.progress}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold">{task.progress}%</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.category} • {format(new Date(task.dueDate), "dd MMM")}</p>
                </div>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}
