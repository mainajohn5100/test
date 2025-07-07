"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface TicketTableToolbarProps {
  statusFilter: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
}

export function TicketTableToolbar({
  statusFilter,
  searchTerm,
  setSearchTerm,
  priorityFilter,
  setPriorityFilter
}: TicketTableToolbarProps) {
  const router = useRouter();

  const handleReset = () => {
    setSearchTerm('');
    setPriorityFilter('all');
    if (statusFilter !== 'all') {
      router.push('/tickets/all');
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-1 flex-col md:flex-row items-center gap-2 w-full">
        <Input
          placeholder="Filter by title, ID, assignee..."
          className="h-9 w-full md:w-auto md:min-w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            router.push(`/tickets/${value}`);
          }}
        >
          <SelectTrigger className="h-9 w-full md:w-auto">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new-status">New</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={priorityFilter}
          onValueChange={(value) => setPriorityFilter(value)}
        >
          <SelectTrigger className="h-9 w-full md:w-auto">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="ghost" className="h-9 px-3" onClick={handleReset}>
        <X className="mr-2 h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
