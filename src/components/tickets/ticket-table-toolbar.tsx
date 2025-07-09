
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
import { useRouter } from "next/navigation";

interface TicketTableToolbarProps {
  statusFilter: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  isFilteredView: boolean;
}

export function TicketTableToolbar({
  statusFilter,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  isFilteredView,
}: TicketTableToolbarProps) {
  const router = useRouter();

  const handleStatusChange = (newStatus: string) => {
    router.push(`/tickets/${newStatus}`);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSortBy('updatedAt_desc');
    // Only navigate if we are not on the 'all' page already
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
        {!isFilteredView && (
          <>
            <Select
              value={statusFilter}
              onValueChange={handleStatusChange}
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
          </>
        )}
      </div>
      {!isFilteredView && (
        <Button variant="ghost" className="h-9 px-3" onClick={handleReset}>
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
