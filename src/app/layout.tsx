import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { raleway, montserrat } from './fonts';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'RequestFlow',
  description: 'A modern ticket management system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", raleway.variable, montserrat.variable)}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
