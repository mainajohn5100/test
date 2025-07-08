
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, Bell, Maximize, Minimize, Moon, Sun, Ticket, Briefcase, MessageSquare } from "lucide-react";
import { Logo } from "@/components/icons";
import { MainNav } from "@/components/main-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useTheme } from "next-themes";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import type { Notification } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { useSettings } from "@/contexts/settings-context";

const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes('ticket')) {
        return <Ticket className="h-4 w-4" />
    }
    if (title.toLowerCase().includes('project')) {
        return <Briefcase className="h-4 w-4" />
    }
    return <MessageSquare className="h-4 w-4" />
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { setTheme } = useTheme();
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const { showFullScreenButton } = useSettings();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = React.useState(true);

  React.useEffect(() => {
    if (!currentUser?.id) {
      setLoadingNotifications(false);
      return;
    }

    setLoadingNotifications(true);
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedNotifications: Notification[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString(),
          } as Notification;
        });
        setNotifications(fetchedNotifications);
        setLoadingNotifications(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setLoadingNotifications(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.id]);

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
  
  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };
  
  React.useEffect(() => {
    const onFullScreenChange = () => {
        setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);


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
            {showFullScreenButton && (
                <Button variant="ghost" size="icon" className="rounded-full" onClick={handleFullScreen}>
                    {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    <span className="sr-only">Toggle Full screen</span>
                </Button>
            )}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full relative">
                        <Bell className="h-5 w-5" />
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                        )}
                        <span className="sr-only">Notifications</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="flex flex-col gap-1 p-1">
                        {loadingNotifications ? (
                           <div className="p-4 text-sm text-muted-foreground text-center">Loading...</div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <DropdownMenuItem key={notification.id} className="flex items-start gap-3 p-2 cursor-pointer" onClick={() => router.push(notification.link)}>
                                    <div className="mt-1 text-muted-foreground">{getNotificationIcon(notification.title)}</div>
                                    <div className="flex flex-col">
                                        <p className="font-medium text-sm">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                                        <p className="text-xs text-muted-foreground/80 mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                                No new notifications
                            </div>
                        )}
                    </div>
                    {notifications.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-sm font-medium text-primary hover:text-primary cursor-pointer">
                            Mark all as read
                        </DropdownMenuItem>
                      </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
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
                 <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                        <span>System</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
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
