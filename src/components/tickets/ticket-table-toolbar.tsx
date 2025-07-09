
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TicketTableToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function TicketTableToolbar({
  searchTerm,
  setSearchTerm,
}: TicketTableToolbarProps) {

  const showReset = searchTerm.length > 0;

  return (
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
  );
}
