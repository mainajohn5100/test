
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo, GoogleIcon } from '@/components/icons';
import { Eye, EyeOff, Loader, TriangleAlert, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { sendPasswordResetEmailAction, sendVerificationEmailAction } from './actions';
import { createUserFromGoogle, getUserById } from '@/lib/firestore';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Helper to handle Firebase errors and provide user-friendly messages
const getFirebaseAuthErrorMessage = (error: any) => {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        return 'Invalid email or password. Please try again.';
    }
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return 'Sign-in process was cancelled.';
    }
     if (error.code === 'auth/account-exists-with-different-credential') {
        return 'An account already exists with this email address using a different sign-in method.';
    }
    if (error.code === 'auth/invalid-api-key') {
        return 'Invalid Firebase API Key. Please check your environment variables.'
    }
    return error.message || 'An unexpected error occurred. Please try again.';
}

function ResetPasswordDialog() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [isPending, startTransition] = React.useTransition();
    const [open, setOpen] = useState(false);

    const handleReset = async () => {
        if (!email) return;
        startTransition(async () => {
            const result = await sendPasswordResetEmailAction(email);
            if (result.success) {
                toast({ title: "Check your email", description: result.message });
                setOpen(false);
            } else {
                toast({ title: "Error", description: result.error, variant: 'destructive' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <Button variant="link" size="sm" className="h-auto p-0 font-normal">Forgot Password?</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reset Your Password</DialogTitle>
                    <DialogDescription>
                        Enter your account's email address and we will send you a link to reset your password.
                    </DialogDescription>
                </DialogHeader>
                 <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="reset-email" 
                            type="email" 
                            placeholder="you@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary" disabled={isPending}>Cancel</Button></DialogClose>
                    <Button onClick={handleReset} disabled={isPending || !email}>
                        {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reset Link
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  
  const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in Firestore
        const appUser = await getUserById(user.uid);
        if (!appUser) {
            // This is a first-time Google sign-in for an existing user or new signup
            // For login, we assume they should have an org. For signup, they're creating one.
            // In a real multi-tenant app, this is where you'd direct them to create/join an org.
            // For now, we'll deny login if they don't have a firestore record.
            await auth.signOut();
            toast({
                title: "Login Failed",
                description: "No organization associated with this Google account. Please sign up first.",
                variant: 'destructive'
            });
            return;
        }
        
        router.push('/dashboard');
        toast({ title: 'Login Successful', description: 'Welcome back!' });

    } catch (error) {
        toast({
            title: 'Login Failed',
            description: getFirebaseAuthErrorMessage(error),
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  }

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFirebaseConfigured || !email || !password) return;
    
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
          toast({
              title: 'Email Not Verified',
              description: 'Please verify your email address.',
              variant: 'destructive',
              action: (
                  <Button variant="secondary" onClick={async () => {
                      const result = await sendVerificationEmailAction();
                      if (result.success) {
                          toast({ title: "Verification Email Sent", description: result.message });
                      } else {
                          toast({ title: "Error", description: result.error, variant: 'destructive' });
                      }
                  }}>
                      Resend Email
                  </Button>
              ),
          });
          // Log out the user until they verify
          await auth.signOut();
          setLoading(false);
          return;
      }

      router.push('/dashboard');
       toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
    } catch (error: any) {
        toast({
            title: 'Login Failed',
            description: getFirebaseAuthErrorMessage(error),
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if(email) {
          setStep(2);
      }
  }


  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm overflow-hidden">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Logo className="w-8 h-8" />
                <h1 className="font-headline font-semibold text-2xl">RequestFlow</h1>
            </div>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <div className="relative p-6 pt-0">
             <div className={cn("transition-transform duration-300", step === 2 && "-translate-x-[110%]")}>
                <div className="space-y-4">
                    {!isFirebaseConfigured && (
                    <Alert variant="destructive">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>Configuration Error</AlertTitle>
                        <AlertDescription>
                        Your Firebase environment variables are not set. Please copy them from your Firebase project settings into your `.env` file.
                        </AlertDescription>
                    </Alert>
                    )}
                    <Button className="w-full" variant="outline" onClick={handleGoogleLogin} disabled={loading || !isFirebaseConfigured}>
                        {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                        Sign in with Google
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <form className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading || !isFirebaseConfigured} />
                        </div>
                        <Button className="w-full" type="button" onClick={handleContinue} disabled={loading || !isFirebaseConfigured || !email}>
                            Continue
                        </Button>
                    </form>
                </div>
             </div>

             <div className={cn("absolute top-0 left-0 w-full p-6 pt-0 transition-transform duration-300", step === 1 && "translate-x-[110%]")}>
                <button onClick={() => { setStep(1); setPassword(''); }} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to email
                </button>
                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <ResetPasswordDialog />
                        </div>
                        <div className="relative">
                            <Input 
                                id="password" 
                                name="password" 
                                type={showPassword ? "text" : "password"} 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                disabled={loading || !isFirebaseConfigured} 
                                className="pr-10"
                                autoFocus
                            />
                            <Button 
                                type="button" 
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={!isFirebaseConfigured}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <Button className="w-full" type="submit" disabled={loading || !isFirebaseConfigured}>
                        {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </form>
             </div>
        </div>
         <CardFooter className="flex flex-col gap-4 pt-0">
            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
