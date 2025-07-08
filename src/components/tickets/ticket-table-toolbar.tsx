
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
import { ListOrdered, X } from "lucide-react";

interface TicketTableToolbarProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

export function TicketTableToolbar({
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
}: TicketTableToolbarProps) {

  const handleReset = () => {
    setSearchTerm('');
    setPriorityFilter('all');
    setSortBy('updatedAt_desc');
    setStatusFilter('all');
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
          onValueChange={(value) => setStatusFilter(value)}
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
         <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full h-9 md:w-auto">
                <ListOrdered className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt_desc">Last Updated</SelectItem>
                <SelectItem value="createdAt_desc">Newest First</SelectItem>
                <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                <SelectItem value="priority_desc">Priority (High-Low)</SelectItem>
                <SelectItem value="priority_asc">Priority (Low-High)</SelectItem>
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
