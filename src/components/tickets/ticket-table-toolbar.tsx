
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ListOrdered } from "lucide-react";

interface TicketTableToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

export function TicketTableToolbar({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
}: TicketTableToolbarProps) {

  const showReset = searchTerm.length > 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-1 flex-col md:flex-row items-center gap-2 w-full">
        <Input
          placeholder="Filter by title, ID, assignee..."
          className="h-10 w-full md:w-auto md:min-w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {showReset && (
          <Button variant="ghost" className="h-10 px-3" onClick={() => setSearchTerm('')}>
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
      <div className="flex gap-2 w-full md:w-auto shrink-0">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full h-10 md:w-auto">
              <ListOrdered className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt_desc">Last Updated</SelectItem>
              <SelectItem value="createdAt_desc">Newest First</SelectItem>
              <SelectItem value="createdAt_asc">Oldest First</SelectItem>
              <SelectItem value="priority_desc">Priority (High-Low)</SelectItem>
              <SelectItem value="priority_asc">Priority (Low-High)</SelectItem>
              <SelectItem value="status_asc">Status</SelectItem>
            </SelectContent>
          </Select>
      </div>
    </div>
  );
}
