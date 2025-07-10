
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import type { User } from "@/lib/data";

type NavItem = {
    label: string;
    icon: React.ElementType;
    href?: string;
    roles: User['role'][];
    subItems?: Omit<NavItem, 'icon' | 'roles'>[];
};

const allTicketSubItems: Omit<NavItem, 'icon' | 'roles'>[] = [
    { label: "All Tickets", href: "/tickets/all" },
    { label: "New", href: "/tickets/new-status" },
    { label: "Active", href: "/tickets/active" },
    { label: "Pending", href: "/tickets/pending" },
    { label: "On Hold", href: "/tickets/on-hold" },
    { label: "Closed", href: "/tickets/closed" },
    { label: "Terminated", href: "/tickets/terminated" },
];

const menuItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ['Admin', 'Agent', 'Customer'],
  },
  {
    label: "Tickets",
    icon: Ticket,
    roles: ['Admin', 'Agent', 'Customer'],
    subItems: [
      ...allTicketSubItems,
      { label: "Create Ticket", href: "/tickets/new" },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart2,
    roles: ['Admin'],
  },
  {
    label: "Projects",
    icon: Briefcase,
    roles: ['Admin', 'Agent', 'Customer'],
    subItems: [
      { label: "All Projects", href: "/projects/all" },
      { label: "New", href: "/projects/new" },
      { label: "Active", href: "/projects/active" },
      { label: "On Hold", href: "/projects/on-hold" },
      { label: "Completed", href: "/projects/completed" },
      { label: "Create Project", href: "/projects/create" },
    ],
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
    roles: ['Admin', 'Agent', 'Customer'],
  },
];

const customerTicketSubItems: Omit<NavItem, 'icon' | 'roles'>[] = [
    ...allTicketSubItems,
    { label: "Create Ticket", href: "/tickets/new" },
];

const customerProjectSubItems: Omit<NavItem, 'icon' | 'roles'>[] = [
    { label: "All Projects", href: "/projects/all" },
];

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) {
    return null;
  }
  
  const accessibleMenuItems = menuItems
    .filter(item => item.roles.includes(user.role))
    .map(item => {
      if (!item.subItems) return item;

      let finalSubItems = item.subItems;

      if (item.label === 'Tickets') {
        if (user.role === 'Customer') {
          finalSubItems = customerTicketSubItems;
        } else if (user.role === 'Agent') {
          finalSubItems = [...allTicketSubItems, { label: "Create Ticket", href: "/tickets/new" }];
        }
      } else if (item.label === 'Projects') {
        if (user.role === 'Customer') {
          finalSubItems = customerProjectSubItems;
        }
      }
      
      if (item.label === 'Settings' && user.role === 'Customer') {
          return { ...item, subItems: undefined } // Direct link, no sub-items for customer
      }

      return { ...item, subItems: finalSubItems };
    });

  return (
    <nav className="flex flex-col p-4 space-y-2">
      <Accordion type="multiple" className="w-full" defaultValue={['item-0', 'item-1', 'item-2', 'item-3', 'item-4', 'item-5']}>
        {accessibleMenuItems.map((item, index) =>
          item.subItems && item.subItems.length > 0 ? (
            <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
              <AccordionTrigger className="py-2 px-3 rounded-md hover:bg-sidebar-accent hover:no-underline text-sm font-medium">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8 pt-2 flex flex-col space-y-1">
                {item.subItems.map((subItem, subIndex) => (
                  <Link href={subItem.href!} key={subIndex} passHref>
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
            <Link href={item.href!} key={index} passHref>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sm font-medium py-2 px-3 h-auto",
                  pathname === item.href && "bg-sidebar-accent"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          )
        )}
      </Accordion>
    </nav>
  );
}
