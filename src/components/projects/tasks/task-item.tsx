

'use client';

import React, { useState } from 'react';
import type { Project, Task, User } from '@/lib/data';
import { format, isPast } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Trash2, User as UserIcon, Loader, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateTaskAction, deleteTaskAction } from '@/app/(app)/projects/view/[id]/actions';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskItemProps {
  task: Task;
  project: Project;
  assignableUsers: User[];
  userMap: Map<string, User>;
  onTaskUpdated: () => void;
}

export function TaskItem({ task, project, assignableUsers, userMap, onTaskUpdated }: TaskItemProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isUpdating, startTransition] = React.useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const assignee = task.assignedTo ? userMap.get(task.assignedTo) : null;
  const isOverdue = task.dueDate ? isPast(new Date(task.dueDate)) : false;
  const isProjectClosed = project.status === 'Completed';

  const canModifyTasks = React.useMemo(() => {
    if (!currentUser || isProjectClosed) return false;
    const isManager = project.manager === currentUser.id;
    const isTeamMemberAndAllowed = project.teamCanEditTasks === true && project.team.includes(currentUser.id);
    return isManager || isTeamMemberAndAllowed;
  }, [currentUser, project, isProjectClosed]);


  const handleUpdate = async (updates: Partial<Task>) => {
    if (!currentUser || !canModifyTasks) return;
    startTransition(async () => {
      const result = await updateTaskAction(project.id, task.id, currentUser.id, updates);
      if (result.success) {
        onTaskUpdated();
        if ('title' in updates) setIsEditing(false);
      } else {
        toast({ title: "Error", description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleDelete = async () => {
     if (!currentUser || !canModifyTasks) return;
     startTransition(async () => {
        const result = await deleteTaskAction(project.id, task.id, currentUser.id);
        if (result.success) {
            toast({title: "Task deleted."});
            onTaskUpdated();
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
     });
  };

  const handleTitleBlur = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      handleUpdate({ title: editedTitle });
    } else {
      setIsEditing(false);
      setEditedTitle(task.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedTitle(task.title);
    }
  };


  return (
    <div className="flex items-center gap-2 p-1 rounded-md hover:bg-muted/50 transition-colors group">
      <Checkbox
        id={`task-${task.id}`}
        checked={task.status === 'completed'}
        onCheckedChange={(checked) => handleUpdate({ status: checked ? 'completed' : 'todo' })}
        disabled={isUpdating || !canModifyTasks}
      />
      <div className="flex-1">
        {isEditing && canModifyTasks ? (
          <Input 
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="h-8"
            autoFocus
          />
        ) : (
          <label
            htmlFor={`task-${task.id}`}
            className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''} ${canModifyTasks ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => canModifyTasks && setIsEditing(true)}
          >
            {task.title}
          </label>
        )}
      </div>
      
      {isOverdue && task.status !== 'completed' && (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Flag className="h-4 w-4 text-destructive"/>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Task is past its due date.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      )}

      {task.dueDate && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarIcon className="h-3.5 w-3.5" />
          {format(new Date(task.dueDate), 'MMM d')}
        </div>
      )}
      
      {assignee && (
         <Avatar className="h-6 w-6">
            <AvatarImage src={assignee.avatar} />
            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
         </Avatar>
      )}

      {canModifyTasks && (
         <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isUpdating}>
                       <UserIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleUpdate({ assignedTo: null })}>Unassigned</DropdownMenuItem>
                    {assignableUsers.map(user => (
                        <DropdownMenuItem key={user.id} onSelect={() => handleUpdate({ assignedTo: user.id })}>
                            {user.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isUpdating}>
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar 
                        mode="single" 
                        selected={task.dueDate ? new Date(task.dueDate) : undefined}
                        onSelect={(date) => handleUpdate({dueDate: date ? date.toISOString() : null})}
                    />
                </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/80 hover:text-destructive" onClick={handleDelete} disabled={isUpdating}>
                {isUpdating ? <Loader className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
            </Button>
         </div>
      )}
    </div>
  );
}
