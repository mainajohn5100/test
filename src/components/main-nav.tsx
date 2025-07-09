
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
    subItems?: Omit<NavItem, 'icon'>[];
};

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
      { label: "All Tickets", href: "/tickets/all", roles: ['Admin', 'Agent', 'Customer'] },
      { label: "New", href: "/tickets/new-status", roles: ['Admin', 'Agent', 'Customer'] },
      { label: "Active", href: "/tickets/active", roles: ['Admin', 'Agent', 'Customer'] },
      { label: "Pending", href: "/tickets/pending", roles: ['Admin', 'Agent', 'Customer'] },
      { label: "On Hold", href: "/tickets/on-hold", roles: ['Admin', 'Agent', 'Customer'] },
      { label: "Closed", href: "/tickets/closed", roles: ['Admin', 'Agent', 'Customer'] },
      { label: "Terminated", href: "/tickets/terminated", roles: ['Admin', 'Agent', 'Customer'] },
      { label: "Create Ticket", href: "/tickets/new", roles: ['Admin', 'Agent'] },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart2,
    roles: ['Admin', 'Agent'],
  },
  {
    label: "Projects",
    icon: Briefcase,
    roles: ['Admin', 'Agent'],
    subItems: [
      { label: "All Projects", href: "/projects/all", roles: ['Admin', 'Agent'] },
      { label: "New", href: "/projects/new", roles: ['Admin', 'Agent'] },
      { label: "Active", href: "/projects/active", roles: ['Admin', 'Agent'] },
      { label: "On Hold", href: "/projects/on-hold", roles: ['Admin', 'Agent'] },
      { label: "Completed", href: "/projects/completed", roles: ['Admin', 'Agent'] },
      { label: "Create Project", href: "/projects/create", roles: ['Admin', 'Agent'] },
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
    roles: ['Admin'],
  },
];

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) {
    // or return a loading skeleton
    return null;
  }
  
  const accessibleMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  ).map(item => {
    if (item.subItems) {
      return {
        ...item,
        subItems: item.subItems.filter(subItem => subItem.roles.includes(user.role))
      };
    }
    return item;
  });


  return (
    <nav className="flex flex-col p-4 space-y-2">
      <Accordion type="multiple" className="w-full" defaultValue={['item-0', 'item-1', 'item-2', 'item-3']}>
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
