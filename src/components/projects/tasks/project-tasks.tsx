
'use client';

import React, { useState } from 'react';
import type { Task, User } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskItem } from './task-item';
import { AddTaskDialog } from './add-task-dialog';
import { Progress } from '@/components/ui/progress';

interface ProjectTasksProps {
  projectId: string;
  initialTasks: Task[];
  assignableUsers: User[];
  canModifyTasks: boolean;
  onTasksUpdate: () => void;
}

export function ProjectTasks({ projectId, initialTasks, assignableUsers, canModifyTasks, onTasksUpdate }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const completedTasks = React.useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);
  const taskProgress = React.useMemo(() => tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0, [completedTasks, tasks]);
  const userMap = new Map(assignableUsers.map(u => [u.id, u]));

  return (
    <Card>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-b-0">
          <div className="flex items-center px-6 pt-4">
             <AccordionTrigger className="flex-1 py-0">
                <div className="flex flex-col">
                  <CardTitle>Project Tasks</CardTitle>
                  <CardDescription className="pt-1">A list of tasks associated with this project.</CardDescription>
                </div>
            </AccordionTrigger>
            {canModifyTasks && (
                <AddTaskDialog
                    projectId={projectId}
                    assignableUsers={assignableUsers}
                    onTaskAdded={() => {
                        setAddDialogOpen(false);
                        onTasksUpdate();
                    }}
                    open={isAddDialogOpen}
                    setOpen={setAddDialogOpen}
                >
                    <Button size="icon" variant="ghost">
                        <Plus className="h-5 w-5" />
                    </Button>
                </AddTaskDialog>
            )}
          </div>
          <CardContent className="px-6 pt-4 pb-6">
             <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Task Progress</span>
                    <span>{completedTasks}/{tasks.length} Completed</span>
                </div>
                <Progress value={taskProgress} />
            </div>
            <AccordionContent>
              <div className="space-y-2 pt-4">
                {tasks.length > 0 ? (
                  tasks.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      projectId={projectId}
                      assignableUsers={assignableUsers}
                      userMap={userMap}
                      canModifyTasks={canModifyTasks}
                      onTaskUpdated={onTasksUpdate}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No tasks have been added to this project yet.</p>
                )}
              </div>
            </AccordionContent>
          </CardContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
