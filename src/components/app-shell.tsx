
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
  useSidebar,
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
import { Search, Bell, Moon, Sun, Ticket, Briefcase, MessageSquare, BellOff, Loader, RefreshCw, Maximize, Minimize, ExternalLink, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/icons";
import { MainNav } from "@/components/main-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useTheme } from "next-themes";
import type { Notification } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { useSettings } from "@/contexts/settings-context";
import { markAllUserNotificationsAsRead, updateNotificationReadStatus } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { onSnapshot, query, collection, where, Timestamp, orderBy, limit } from "firebase/firestore";
import { SheetTitle } from "./ui/sheet";

export const dynamic = 'force-dynamic'

const getNotificationIcon = (notification: Notification) => {
    if (notification.type === 'new_reply') return <MessageSquare className="h-4 w-4" />
    if (notification.title.toLowerCase().includes('ticket')) return <Ticket className="h-4 w-4" />
    if (notification.title.toLowerCase().includes('project')) return <Briefcase className="h-4 w-4" />
    return <MessageSquare className="h-4 w-4" />
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const { isMobile } = useSidebar();
  const { inAppNotifications, showFullScreenButton } = useSettings();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = React.useState(true);
  const [globalSearchTerm, setGlobalSearchTerm] = React.useState('');
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  
  const unreadCount = React.useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearchTerm.trim()) {
      router.push(`/tickets/all?search=${encodeURIComponent(globalSearchTerm.trim())}`);
    }
  };

  // Real-time listener for notifications
  React.useEffect(() => {
    if (!currentUser?.id || !inAppNotifications) {
      setLoadingNotifications(false);
      setNotifications([]);
      return () => {};
    }

    setLoadingNotifications(true);
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.id),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allNotifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
        }) as Notification)

        setNotifications(allNotifications);
        setLoadingNotifications(false);
      },
      (error) => {
        console.error("Firebase onSnapshot error fetching notifications:", error);
        toast({ 
            title: "Notification Error", 
            description: "Could not listen for real-time notifications. This might be a permissions issue with your Firestore security rules.", 
            variant: "destructive",
            duration: 10000,
        });
        setLoadingNotifications(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.id, inAppNotifications, toast]);


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

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
        try {
            await updateNotificationReadStatus(notification.id, true);
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    }
    router.push(notification.link);
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.id || unreadCount === 0) {
        return;
    }
    try {
        await markAllUserNotificationsAsRead(currentUser.id);
        toast({
            title: "Notifications marked as read",
        });
    } catch (error) {
        console.error("Failed to mark all as read", error);
        toast({
            title: "Error",
            description: "Could not mark all notifications as read.",
            variant: "destructive",
        });
    }
  };

  const handleFullScreenChange = () => {
    setIsFullScreen(!!document.fullscreenElement);
  };
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  React.useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const showBackButton = isMobile && (pathname.includes('/tickets/view/') || pathname.includes('/projects/view/'));

  return (
    <>
      <Sidebar variant="sidebar" collapsible="icon" side="left">
        <SidebarHeader>
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
        <SidebarFooter>
          {currentUser && !isMobile ? (
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
          ) : !isMobile ? (
            <div className="flex items-center gap-3 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
          ) : null}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            {showBackButton ? (
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                </Button>
            ) : (
                <SidebarTrigger className="md:hidden" />
            )}
          <div className="flex-1">
            <SidebarTrigger className="hidden md:block" />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tickets..." 
                className="pl-9" 
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                onKeyDown={handleGlobalSearch}
              />
            </div>
             {showFullScreenButton && (
                <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
                    {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    <span className="sr-only">Toggle Fullscreen</span>
                </Button>
            )}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full relative">
                        {inAppNotifications ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                        {inAppNotifications && unreadCount > 0 && (
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                        )}
                        <span className="sr-only">Notifications</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96">
                    <div className="flex justify-between items-center p-2 pr-1">
                      <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                      {inAppNotifications && notifications.length > 0 && unreadCount > 0 && (
                           <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-auto p-1 font-medium">
                              Mark all as read
                           </Button>
                        )}
                    </div>
                    <DropdownMenuSeparator />
                    {inAppNotifications ? (
                        <ScrollArea className="h-auto max-h-96">
                          <div className="flex flex-col gap-1 p-1">
                              {loadingNotifications ? (
                                 <div className="p-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2"><Loader className="h-4 w-4 animate-spin"/>Loading...</div>
                              ) : notifications.length > 0 ? (
                                  notifications.map((notification) => (
                                      <DropdownMenuItem key={notification.id} asChild className={cn("flex items-start gap-3 p-2 cursor-pointer h-auto", !notification.read && "bg-accent/50 hover:bg-accent/60")}>
                                        <button onClick={() => handleNotificationClick(notification)} className="w-full text-left">
                                          <div className="flex items-start gap-3">
                                            <div className="mt-1 text-muted-foreground">{getNotificationIcon(notification)}</div>
                                            <div className="flex flex-col flex-1 whitespace-normal">
                                                <p className="font-medium text-sm leading-tight">{notification.title}</p>
                                                <p className="text-xs text-muted-foreground leading-snug">{notification.description}</p>
                                                <p className="text-xs text-muted-foreground/80 mt-1">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                          </div>
                                        </button>
                                      </DropdownMenuItem>
                                  ))
                              ) : (
                                  <div className="p-4 text-sm text-muted-foreground text-center">
                                      You're all caught up!
                                  </div>
                              )}
                          </div>
                        </ScrollArea>
                    ) : (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                            In-app notifications are disabled.
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            {currentUser && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>{currentUser.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </SidebarInset>
    </>
  );
}


export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  )
}
