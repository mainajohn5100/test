
'use client';
import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building, LayoutDashboard, Loader, Shield, ShieldAlert, Users, Search, Maximize, Minimize, LifeBuoy, DollarSign, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { inter } from "@/app/fonts";

function SuperAdminNav() {
    const pathname = usePathname();
    return (
        <nav className="flex flex-col p-2 space-y-1">
            <Link href="/superadmin">
                <Button variant="ghost" className={cn("w-full justify-start gap-2", pathname === '/superadmin' && "bg-sidebar-accent")}>
                    <LayoutDashboard />
                    <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                </Button>
            </Link>
            <Link href="/organizations">
                 <Button variant="ghost" className={cn("w-full justify-start gap-2", pathname === '/organizations' && "bg-sidebar-accent")}>
                    <Building />
                    <span className="group-data-[collapsible=icon]:hidden">Organizations</span>
                </Button>
            </Link>
            <Link href="/revenue">
                 <Button variant="ghost" className={cn("w-full justify-start gap-2", pathname === 'revenue' && "bg-sidebar-accent")}>
                    <DollarSign />
                    <span className="group-data-[collapsible=icon]:hidden">Revenue</span>
                </Button>
            </Link>
            <Link href="/settings">
                 <Button variant="ghost" className={cn("w-full justify-start gap-2", pathname === '/settings' && "bg-sidebar-accent")}>
                    <Settings />
                    <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                </Button>
            </Link>
        </nav>
    );
}

function SuperAdminShellContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [accessAllowed, setAccessAllowed] = React.useState(false);
  const [checkingAccess, setCheckingAccess] = React.useState(true);

  React.useEffect(() => {
    if (!loading) {
      if (user?.role === 'Admin' && user.email === process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL) {
        setAccessAllowed(true);
      } else {
        setAccessAllowed(false);
      }
      setCheckingAccess(false);
    }
  }, [user, loading]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        router.push('/login');
    } catch (error) {
        console.error("Error signing out: ", error);
        toast({ title: 'Error', description: 'Failed to sign out.', variant: 'destructive' });
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

  if (loading || checkingAccess) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!accessAllowed) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center justify-center text-center">
          <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            You do not have permission to access the superadmin dashboard.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="mt-6" >
            Return to App
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar variant="sidebar" side="left" collapsible="icon">
         <SidebarHeader className="border-b">
              <Link href="/superadmin" className="flex items-center gap-2">
                  <Shield className="w-8 h-8 text-sidebar-primary" />
                  <span className="font-headline font-semibold text-xl text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                  Superadmin
                  </span>
              </Link>
          </SidebarHeader>
          <SidebarContent>
              <SuperAdminNav />
          </SidebarContent>
          <SidebarFooter>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="justify-start w-full h-auto p-2">
                  <div className="flex justify-between items-center w-full">
                      <div className="flex gap-3 items-center">
                      <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                          <span className="text-sm font-medium">{user?.name}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                      </div>
                  </div>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>Back to App</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
          </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center">
              <SidebarTrigger className="hidden md:block" />
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-9" />
              </div>
               <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
                  {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  <span className="sr-only">Toggle Fullscreen</span>
              </Button>
              <Link href="/support" passHref>
                <Button variant="ghost" size="icon">
                    <LifeBuoy className="h-5 w-5" />
                    <span className="sr-only">Support</span>
                </Button>
              </Link>
              {user && (
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                              <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar} alt={user.name} />
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push('/dashboard')}>Back to App</DropdownMenuItem>
                          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              )}
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
        </main>
      </SidebarInset>
    </>
  );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={inter.className}>
        <SidebarProvider>
            <SuperAdminShellContent>{children}</SuperAdminShellContent>
        </SidebarProvider>
    </div>
  );
}
