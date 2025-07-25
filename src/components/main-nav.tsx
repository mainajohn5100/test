
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import type { User } from "@/lib/data";
import { useSidebar } from "./ui/sidebar";
import { useSettings } from "@/contexts/settings-context";

type NavItem = {
    label: string;
    icon: React.ElementType;
    href?: string;
    roles: User['role'][];
    subItems?: Omit<NavItem, 'icon' | 'roles'>[];
    setting?: string;
};

const menuItems: NavItem[] = [
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
  {
    label: "User Accounts",
    href: "/users",
    icon: Users,
    roles: ['Admin'],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ['Admin', 'Agent', 'Client'],
  },
];

const clientProjectSubItems: Omit<NavItem, 'icon' | 'roles'>[] = [
    { label: "All Projects", href: "/projects/all" },
];

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
  
  const accessibleMenuItems = menuItems
    .filter(item => {
        if (!item.roles.includes(user.role)) return false;
        if (item.setting === 'projectsEnabled' && !projectsEnabled) return false;
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
    <nav className="flex flex-col p-4 space-y-32">
      <Accordion type="multiple" className="w-full">
        {accessibleMenuItems.map((item, index) =>
          item.subItems && item.subItems.length > 0 ? (
            <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
              <AccordionTrigger className="py-2 px-3 rounded-md hover:bg-sidebar-accent hover:no-underline text-sm font-medium group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
                <div className="flex items-center gap-5">
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
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </Button>
            </Link>
          )
        )}
      </Accordion>
    </nav>
  );
}
