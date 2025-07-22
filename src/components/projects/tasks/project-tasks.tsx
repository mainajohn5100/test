
'use client';

import React, { useState, useEffect } from 'react';
import type { Project, Task, User } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical } from 'lucide-react';
import { TaskItem } from './task-item';
import { AddTaskDialog } from './add-task-dialog';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateProjectAction } from '@/app/(app)/projects/view/[id]/actions';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ProjectTasksProps {
  project: Project;
  assignableUsers: User[];
  onTasksUpdate: () => void; // This will now be used to signal parent re-renders if needed, but tasks are real-time.
}

export function ProjectTasks({ project, assignableUsers, onTasksUpdate }: ProjectTasksProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isUpdating, startTransition] = React.useTransition();
  
  useEffect(() => {
    const tasksCol = collection(db, 'projects', project.id, 'tasks');
    const q = query(tasksCol, orderBy('title', 'asc')); // Example ordering
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                dueDate: data.dueDate ? data.dueDate.toDate().toISOString() : null,
            } as Task;
        });
        setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [project.id]);

  const completedTasks = React.useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);
  const taskProgress = React.useMemo(() => tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0, [completedTasks, tasks]);
  const userMap = new Map(assignableUsers.map(u => [u.id, u]));
  
  const isProjectClosed = project.status === 'Completed';
  const teamCanEditTasks = project.teamCanEditTasks === true;

  const isManager = currentUser?.id === project.manager;
  
  const canModifyTasks = React.useMemo(() => {
    if (!currentUser || isProjectClosed) return false;
    const isManager = project.manager === currentUser.id;
    const isTeamMemberAndAllowed = project.teamCanEditTasks === true && project.team.includes(currentUser.id);
    return isManager || isTeamMemberAndAllowed;
  }, [currentUser, project, isProjectClosed]);


  const handlePermissionChange = (enabled: boolean) => {
    if (!currentUser) return;
    startTransition(async () => {
      const result = await updateProjectAction(project.id, { teamCanEditTasks: enabled }, currentUser.id);
      if (result.success) {
        toast({ title: "Permissions updated" });
        onTasksUpdate();
      } else {
        toast({ title: "Error", description: result.error, variant: 'destructive' });
      }
    });
  }

  return (
    <Card>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b-0">
           <div className="flex items-center px-6 pt-6">
                <div className="flex-1">
                    <CardTitle>Project Tasks</CardTitle>
                    <CardDescription className="pt-1">A list of tasks associated with this project.</CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    {canModifyTasks && (
                        <AddTaskDialog
                            projectId={project.id}
                            assignableUsers={assignableUsers}
                            onTaskAdded={() => {
                                setAddDialogOpen(false);
                                // No need to call onTasksUpdate, real-time listener will handle it.
                            }}
                            open={isAddDialogOpen}
                            setOpen={setAddDialogOpen}
                        >
                            <Button size="icon" variant="ghost">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </AddTaskDialog>
                    )}
                    {isManager && !isProjectClosed && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Label htmlFor="team-can-edit" className="pr-2 font-normal text-sm">Allow Team to Edit</Label>
                                    <Switch
                                        id="team-can-edit"
                                        checked={teamCanEditTasks}
                                        onCheckedChange={handlePermissionChange}
                                        disabled={isUpdating || isProjectClosed}
                                    />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                     <AccordionTrigger className="p-0 pl-4 hover:no-underline" />
                </div>
            </div>
          <CardContent className="px-6 pb-6 pt-4">
            <div className="space-y-2 mb-4 pt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Task Progress</span>
                    <span>{completedTasks}/{tasks.length} Completed ({taskProgress.toFixed(0)}%)</span>
                </div>
                <Progress value={taskProgress} />
            </div>
            <AccordionContent>
              <div className="space-y-2">
                {tasks.length > 0 ? (
                  tasks.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      project={project}
                      assignableUsers={assignableUsers}
                      userMap={userMap}
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
