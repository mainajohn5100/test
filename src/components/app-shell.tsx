"use client";

import React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, Bell, Maximize } from "lucide-react";
import { Logo } from "@/components/icons";
import { MainNav } from "@/components/main-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";


export function AppShell({ children }: { children: React.ReactNode }) {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const handleProfileClick = () => {
      if (currentUser) {
          router.push(`/users/${currentUser.id}`);
      }
  };

  const handleLogout = async () => {
    try {
        await signOut(auth);
        router.push('/login');
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon" side="left">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-sidebar-primary" />
            <span className="font-headline font-semibold text-xl text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              RequestFlow
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start w-full h-auto p-2">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex gap-3 items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium">{currentUser.name}</span>
                        <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel>{currentUser.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
                <DropdownMenuItem disabled>Billing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Can be used for breadcrumbs */}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9" />
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
                <Maximize className="h-5 w-5" />
                <span className="sr-only">Full screen</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" disabled={!currentUser}>
                  <Avatar className="h-8 w-8">
                    {currentUser ? (
                      <>
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                      </>
                    ) : (
                      <Skeleton className="h-8 w-8 rounded-full" />
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuItem disabled>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
