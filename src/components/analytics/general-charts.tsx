
'use client';

// This file is deprecated and its contents have been moved to more specific chart components.
// It is kept to prevent breaking imports, but can be removed in a future cleanup.

import * as React from "react";
import type { Ticket, Project, User } from "@/lib/data";


export function GeneralReportDashboard({ tickets, projects, users }: { tickets: Ticket[], projects: Project[], users: User[] }) {
    return (
        <div className="text-center text-muted-foreground p-8">
            General report charts have been moved to more specific components.
        </div>
    );
}
