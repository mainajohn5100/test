

'use client';
import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from 'firebase/auth';
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { Loader, ShieldAlert } from "lucide-react";
import { useInactivity } from "@/hooks/use-inactivity";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { 
    agentPanelEnabled, 
    clientPanelEnabled, 
    loading: settingsLoading,
    loadingScreenStyle 
  } = useSettings();
  const router = useRouter();
  const { toast } = useToast();
  const [accessDenied, setAccessDenied] = React.useState(false);

  const handleLogout = (message?: string) => {
    router.replace('/login');
    signOut(auth).then(() => {
      toast({
        title: "Signed Out",
        description: message || "You have been signed out."
      });
    }).catch((error) => {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "There was an error signing out.",
        variant: "destructive"
      });
    });
  };
  
  useInactivity(() => {
    handleLogout("You have been logged out due to inactivity.");
  });


  React.useEffect(() => {
    if (authLoading || settingsLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }
    
    let isDenied = false;
    
    if (user.role === 'Agent' && !agentPanelEnabled) {
      isDenied = true;
    } else if (user.role === 'Client' && !clientPanelEnabled) {
      isDenied = true;
    }
    
    setAccessDenied(isDenied);

  }, [user, authLoading, settingsLoading, router, agentPanelEnabled, clientPanelEnabled]);

  const handleAccessDeniedLogout = () => {
      handleLogout("You have been signed out because your access level has changed.");
  }

  // Show loading while auth is loading or settings are loading
  if (authLoading || settingsLoading || !user) {
     if (loadingScreenStyle === 'skeleton' && !user) {
        return (
          <AppShell>
            <DashboardSkeleton />
          </AppShell>
        );
    }
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show access denied screen
  if (accessDenied) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center justify-center text-center">
          <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Access Disabled</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            Access for your role ({user?.role}) has been disabled by an administrator. 
            Please contact support if you believe this is an error.
          </p>
          <Button onClick={handleAccessDeniedLogout} className="mt-6">
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
