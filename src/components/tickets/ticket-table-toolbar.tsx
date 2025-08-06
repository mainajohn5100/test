
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, MoreVertical, ListOrdered, Mail, MessageCircle, NotebookText, Briefcase, Filter, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useSettings } from "@/contexts/settings-context";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";

interface TicketTableToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  channelFilter: string;
  setChannelFilter: (value: string) => void;
}

export function TicketTableToolbar({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  statusFilter,
  setStatusFilter,
  channelFilter,
  setChannelFilter
}: TicketTableToolbarProps) {

  const { ticketStatuses, excludeClosedTickets, setExcludeClosedTickets } = useSettings();
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
          <TooltipProvider>
            <ToggleGroup type="single" value={channelFilter} onValueChange={(value) => value && setChannelFilter(value)} defaultValue="all">
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="all" aria-label="Toggle all channels">
                    <NotebookText className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>All Channels</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="email" aria-label="Toggle email channel">
                    <Mail className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Email</p>
                </TooltipContent>
              </Tooltip>
               <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="whatsapp" aria-label="Toggle whatsapp channel">
                    <MessageCircle className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>WhatsApp</p>
                </TooltipContent>
              </Tooltip>
               <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="project" aria-label="Toggle project channel">
                    <Briefcase className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Project</p>
                </TooltipContent>
              </Tooltip>
               <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="webform" aria-label="Toggle web form channel">
                    <FileText className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Web Form</p>
                </TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </TooltipProvider>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full h-10 md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ticketStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <div className="flex items-center justify-between w-full">
                        <Label htmlFor="hide-closed-main" className="pr-2 font-normal">Hide Closed Tickets</Label>
                        <Switch
                            id="hide-closed-main"
                            checked={excludeClosedTickets}
                            onCheckedChange={setExcludeClosedTickets}
                        />
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
