'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <div className="bg-muted/40">{children}</div>;
}
