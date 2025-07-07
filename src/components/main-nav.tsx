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
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tickets",
    icon: Ticket,
    subItems: [
      { label: "All Tickets", href: "/tickets/all" },
      { label: "New Tickets", href: "/tickets/new-list" }, // Differentiating from create new
      { label: "Pending Tickets", href: "/tickets/pending" },
      { label: "On Hold", href: "/tickets/on-hold" },
      { label: "Closed", href: "/tickets/closed" },
      { label: "Active", href: "/tickets/active" },
      { label: "Terminated", href: "/tickets/terminated" },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart2,
  },
  {
    label: "Projects",
    icon: Briefcase,
    subItems: [
      { label: "All Projects", href: "/projects/all" },
      { label: "New", href: "/projects/new-list" },
      { label: "Active", href: "/projects/active" },
      { label: "On Hold", href: "/projects/on-hold" },
      { label: "Completed", href: "/projects/completed" },
    ],
  },
  {
    label: "User Accounts",
    href: "/users",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col p-4 space-y-2">
      <Accordion type="multiple" className="w-full">
        {menuItems.map((item, index) =>
          item.subItems ? (
            <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
              <AccordionTrigger className="py-2 px-3 rounded-md hover:bg-sidebar-accent hover:no-underline text-sm font-medium">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8 pt-2 flex flex-col space-y-1">
                {item.subItems.map((subItem, subIndex) => (
                  <Link href={subItem.href} key={subIndex} passHref>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start",
                        pathname === subItem.href && "bg-sidebar-accent"
                      )}
                    >
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
                  "w-full justify-start gap-3 text-sm font-medium",
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
