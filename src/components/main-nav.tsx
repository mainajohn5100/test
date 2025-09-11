
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Ticket,
  BarChart2,
  Briefcase,
  Users,
  Settings,
  PlusCircle,
  Link2,
  LifeBuoy,
  Building,
  Shield,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import type { User, Ticket as TicketType } from "@/lib/data";
import { useSidebar } from "./ui/sidebar";
import { useSettings } from "@/contexts/settings-context";
import React from "react";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { differenceInMinutes } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { getTickets } from "@/lib/firestore";
import { Badge } from "./ui/badge";

type NavItem = {
    label: string;
    icon: React.ElementType;
    href?: string;
    roles: User['role'][];
    subItems?: Omit<NavItem, 'icon' | 'roles'>[];
    setting?: string;
};

const generalMenuItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ['Admin', 'Agent', 'Client'],
  },
  {
    label: "Tickets",
    href: "/tickets",
    icon: Ticket,
    roles: ['Admin', 'Agent', 'Client'],
  },
  {
    label: "Projects",
    icon: Briefcase,
    roles: ['Admin', 'Agent', 'Client'],
    subItems: [
      { label: "All Projects", href: "/projects/all" },
      { label: "New", href: "/projects/new" },
      { label: "Active", href: "/projects/active" },
      { label: "On Hold", href: "/projects/on-hold" },
      { label: "Completed", href: "/projects/completed" },
      { label: "Create Project", href: "/projects/create" },
    ],
    setting: "projectsEnabled",
  },
];

const adminMenuItems: NavItem[] = [
  {
    label: "Organization",
    href: "/organization/dashboard",
    icon: Building,
    roles: ['Admin'],
  },
  {
    label: "User Accounts",
    href: "/users",
    icon: Users,
    roles: ['Admin'],
  },
  {
    label: "Channels",
    href: "/channels",
    icon: Link2,
    roles: ['Admin'],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart2,
    roles: ['Admin'],
  },
];

const superAdminMenuItems: NavItem[] = [
    {
        label: "Superadmin",
        href: "/superadmin",
        icon: Shield,
        roles: ['Admin'],
    }
]

const bottomMenuItems: NavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ['Admin', 'Agent', 'Client'],
  },
  {
    label: "Support",
    href: "/support",
    icon: LifeBuoy,
    roles: ['Admin', 'Agent', 'Client'],
  },
];


const clientProjectSubItems: Omit<NavItem, 'icon' | 'roles'>[] = [
    { label: "All Projects", href: "/projects/all" },
];

function TicketCounter() {
    const { user } = useAuth();
    const [activeTicketCount, setActiveTicketCount] = React.useState(0);

    React.useEffect(() => {
        if (!user) return;

        const ticketsCol = collection(db, 'tickets');
        const queries = [where("organizationId", "==", user.organizationId)];
        
        if (user.role === 'Client') {
            queries.push(where("reporterEmail", "==", user.email));
        } else if (user.role === 'Agent') {
            queries.push(where("assignee", "==", user.name));
        }
        
        const q = query(ticketsCol, ...queries);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ticketsData = snapshot.docs.map(doc => doc.data() as TicketType);
            const activeTickets = ticketsData.filter(t => t.status !== 'Closed' && t.status !== 'Terminated');
            setActiveTicketCount(activeTickets.length);
        });

        return () => unsubscribe();
    }, [user]);

    if (activeTicketCount > 0) {
        return <Badge variant="secondary" className="ml-auto group-data-[collapsible=icon]:hidden">{activeTicketCount}</Badge>;
    }
    return null;
}

function NavItems({ items, user, projectsEnabled, pathname, handleLinkClick }: { items: NavItem[], user: User, projectsEnabled: boolean, pathname: string, handleLinkClick: () => void }) {
    const accessibleMenuItems = items
    .filter(item => {
        if (!item.roles.includes(user.role)) return false;
        if (item.setting === 'projectsEnabled' && !projectsEnabled) return false;
        if (item.label === 'Superadmin' && user.email !== process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL) return false;
        return true;
    })
    .map(item => {
      if (!item.subItems) return item;

      let finalSubItems = item.subItems;

      if (item.label === 'Projects') {
        if (user.role === 'Client') {
          finalSubItems = clientProjectSubItems;
        }
      }
      
      if (item.label === 'Settings' && user.role === 'Client') {
          return { ...item, subItems: undefined } // Direct link, no sub-items for client
      }

      return { ...item, subItems: finalSubItems };
    });

    return (
         <Accordion type="multiple" className="w-full">
        {accessibleMenuItems.map((item, index) =>
          item.subItems && item.subItems.length > 0 ? (
            <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
              <AccordionTrigger className="py-2 px-3 rounded-md hover:bg-sidebar-accent hover:no-underline text-sm font-medium group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
                <div className="flex items-center gap-5 group-data-[collapsible=icon]:justify-center">
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8 pt-2 flex flex-col space-y-1 group-data-[collapsible=icon]:hidden">
                {item.subItems.map((subItem, subIndex) => (
                  <Link href={subItem.href!} key={subIndex} passHref onClick={handleLinkClick}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start",
                        pathname === subItem.href && "bg-sidebar-accent"
                      )}
                    >
                      {subItem.href === '/tickets/new' && <PlusCircle className="mr-2 h-4 w-4" />}
                      {subItem.href === '/projects/create' && <PlusCircle className="mr-2 h-4 w-4" />}
                      {subItem.label}
                    </Button>
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          ) : (
            <Link href={item.href!} key={index} passHref onClick={handleLinkClick}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sm font-medium py-2 px-3 h-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10",
                  pathname.startsWith(item.href!) && "bg-sidebar-accent"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden flex-1 text-left">{item.label}</span>
                 {item.label === "Tickets" && <TicketCounter />}
              </Button>
            </Link>
          )
        )}
      </Accordion>
    )
}

function ActiveAgentsGlimpse({ handleLinkClick }: { handleLinkClick: () => void }) {
    const { user } = useAuth();
    const [agents, setAgents] = React.useState<User[]>([]);
    const [tickets, setTickets] = React.useState<TicketType[]>([]);
    
    const isUserOnline = (lastSeen?: string) => {
        if (!lastSeen) return false;
        return differenceInMinutes(new Date(), new Date(lastSeen)) < 3;
    };
    
    React.useEffect(() => {
        if (!user || user.role !== 'Admin' || !user.organizationId) {
            setAgents([]);
            return;
        };
        
        getTickets(user).then(setTickets);

        const usersCol = collection(db, 'users');
        const q = query(
            usersCol, 
            where("organizationId", "==", user.organizationId),
            where("role", "in", ["Admin", "Agent"]),
            where("status", "==", "active")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => {
                const data = doc.data();
                const lastSeen = data.lastSeen as Timestamp;
                return { 
                    id: doc.id,
                    ...data,
                    lastSeen: lastSeen ? lastSeen.toDate().toISOString() : undefined,
                 } as User;
            });
            const activeUsers = usersData.filter(u => isUserOnline(u.lastSeen));
            setAgents(activeUsers);
        });

        return () => unsubscribe();
    }, [user]);
    
    const getActiveTicketCount = (agentName: string) => {
        return tickets.filter(t => t.assignee === agentName && t.status !== 'Closed' && t.status !== 'Terminated').length;
    };

    if (!user || user.role !== 'Admin') return null;

    return (
        <div className="group-data-[collapsible=icon]:hidden px-2 pt-2">
            <h3 className="px-1 py-1 text-xs font-semibold text-sidebar-foreground/70 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Active Agents
            </h3>
            {agents.length > 0 ? (
                <div className="flex flex-col gap-1 mt-1">
                    {agents.map(agent => (
                        <TooltipProvider key={agent.id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href={`/users/${agent.id}`} onClick={handleLinkClick} className="w-full">
                                        <Button variant="ghost" className="w-full justify-between gap-2 h-auto p-2">
                                            <div className="flex items-center gap-2 truncate">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={agent.avatar} />
                                                    <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-normal truncate">{agent.name}</span>
                                            </div>
                                            <Badge variant="secondary">{getActiveTicketCount(agent.name)}</Badge>
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center">
                                    <p>{agent.name} has {getActiveTicketCount(agent.name)} active tickets.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground px-2 py-1">No agents currently active.</p>
            )}
        </div>
    );
}


export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { projectsEnabled } = useSettings();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  if (!user) {
    return null;
  }
  
  return (
    <nav className="flex flex-col p-2 space-y-2 h-full">
      <div className="flex-1">
        <NavItems items={generalMenuItems} user={user} projectsEnabled={projectsEnabled} pathname={pathname} handleLinkClick={handleLinkClick} />
        {user.role === 'Admin' && (
            <div className="mt-4">
                <div className="px-3 py-2 group-data-[collapsible=icon]:hidden">
                    <h2 className="text-sm font-semibold text-sidebar-foreground/70">Admin</h2>
                </div>
                <NavItems items={adminMenuItems} user={user} projectsEnabled={projectsEnabled} pathname={pathname} handleLinkClick={handleLinkClick} />
                <div className="mt-2">
                    <ActiveAgentsGlimpse handleLinkClick={handleLinkClick} />
                </div>
            </div>
        )}
      </div>
       <div className="mt-auto">
        <NavItems items={bottomMenuItems} user={user} projectsEnabled={projectsEnabled} pathname={pathname} handleLinkClick={handleLinkClick} />
        {user.role === 'Admin' && (
            <NavItems items={superAdminMenuItems} user={user} projectsEnabled={projectsEnabled} pathname={pathname} handleLinkClick={handleLinkClick} />
        )}
      </div>
    </nav>
  );
}
