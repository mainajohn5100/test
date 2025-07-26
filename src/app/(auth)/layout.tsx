'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect now correctly handles redirecting an already logged-in user
    // away from the auth pages (/login, /signup).
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // While loading, or if the user is already authenticated (and about to be redirected),
  // show a loading spinner. This prevents the login/signup form from flashing.
  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not loading and no user is found, render the auth pages (login/signup).
  return <div className="bg-muted/40">{children}</div>;
}
