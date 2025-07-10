
// 'use client';

// import React from "react";
// import { useRouter } from "next/navigation";
// import { signOut } from 'firebase/auth';

// import { AppShell } from "@/components/app-shell";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/contexts/auth-context";
// import { useSettings } from "@/contexts/settings-context";
// import { useToast } from "@/hooks/use-toast";
// import { auth } from "@/lib/firebase";
// import { Loader, ShieldAlert } from "lucide-react";


// export default function AppLayout({ children }: { children: React.ReactNode }) {
//   const { user, loading } = useAuth();
//   const { agentPanelEnabled, customerPanelEnabled } = useSettings();
//   const router = useRouter();
//   const { toast } = useToast();
//   const [accessDenied, setAccessDenied] = React.useState(false);

//   React.useEffect(() => {
//     if (loading) return;

//     if (!user) {
//       router.replace('/login');
//       return;
//     }
    
//     let isDenied = false;
//     if (user.role === 'Agent' && !agentPanelEnabled) {
//       isDenied = true;
//     }
//     if (user.role === 'Customer' && !customerPanelEnabled) {
//       isDenied = true;
//     }
    
//     if (isDenied) {
//         setAccessDenied(true);
//     } else {
//         setAccessDenied(false);
//     }

//   }, [user, loading, router, agentPanelEnabled, customerPanelEnabled]);

//   const handleLogout = async () => {
//     await signOut(auth);
//     toast({ title: "Signed Out", description: "You have been signed out because your access level has changed." });
//     router.replace('/login');
//   };

//   if (loading) {
//     return (
//        <div className="flex h-screen w-full items-center justify-center bg-background">
//         <Loader className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   if (accessDenied) {
//       return (
//           <div className="flex h-screen w-full items-center justify-center bg-background p-4">
//               <div className="flex flex-col items-center justify-center text-center">
//                   <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
//                   <h2 className="text-2xl font-bold">Access Disabled</h2>
//                   <p className="text-muted-foreground max-w-sm mt-2">
//                       Access for your role has been disabled by an administrator. Please contact support if you believe this is an error.
//                   </p>
//                   <Button onClick={handleLogout} className="mt-6">
//                       Return to Login
//                   </Button>
//               </div>
//           </div>
//       );
//   }

//   if (!user) {
//       // This case is for when the user is logged out or access is denied,
//       // but the component is still rendering for a moment.
//       return (
//          <div className="flex h-screen w-full items-center justify-center bg-background">
//           <Loader className="h-8 w-8 animate-spin" />
//         </div>
//       );
//   }

//   return <AppShell>{children}</AppShell>;
// }


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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { agentPanelEnabled, customerPanelEnabled, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const { toast } = useToast();
  const [accessDenied, setAccessDenied] = React.useState(false);

  React.useEffect(() => {
    // Wait for auth to load and settings to be loaded
    if (authLoading || settingsLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }
    
    let isDenied = false;
    
    // Check access based on user role and panel settings
    if (user.role === 'Agent' && !agentPanelEnabled) {
      isDenied = true;
    } else if (user.role === 'Customer' && !customerPanelEnabled) {
      isDenied = true;
    }
    
    console.log('Access check:', {
      userRole: user.role,
      agentPanelEnabled,
      customerPanelEnabled,
      isDenied
    }); // Debug log - remove in production
    
    setAccessDenied(isDenied);

  }, [user, authLoading, settingsLoading, router, agentPanelEnabled, customerPanelEnabled]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ 
        title: "Signed Out", 
        description: "You have been signed out because your access level has changed." 
      });
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({ 
        title: "Error", 
        description: "There was an error signing out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show loading while auth is loading or settings are loading
  if (authLoading || settingsLoading) {
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
          <Button onClick={handleLogout} className="mt-6">
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}