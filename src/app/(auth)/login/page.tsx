
'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
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
import { sendPasswordResetEmailAction, sendVerificationEmailAction, checkUserExistsByEmail } from './actions';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { createUserInFirestore, getUserById } from '@/lib/firestore';

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
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [emailError, setEmailError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;

        // Check if user exists in our Firestore DB
        const appUser = await getUserById(fbUser.uid);

        if (appUser && appUser.organizationId) {
            // User exists and has an org, proceed to dashboard
             toast({ title: 'Login Successful', description: 'Welcome back!' });
        } else {
             // New user or user without an org. Create a shell user if they don't exist.
            if (!appUser) {
                await createUserInFirestore(fbUser.uid, {
                    name: fbUser.displayName || 'New User',
                    email: fbUser.email || '',
                    avatar: fbUser.photoURL || '',
                    role: 'Admin', // Default new signups to Admin
                    status: 'active',
                    activityIsPublic: false,
                    organizationId: '', // This will be filled in the next step
                    phone: ''
                });
            }
            toast({ title: 'Welcome!', description: 'Just one more step to get started.' });
        }

        await refreshUser(); // This will update the auth context and trigger the CreateOrganizationFlow if needed
        router.push('/dashboard');

    } catch (error: any) {
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
          await auth.signOut();
          setLoading(false);
          return;
      }
      
      await refreshUser();
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
  
  const handleContinue = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (!email) return;
      setLoading(true);
      setEmailError(null);
      
      try {
        const userExists = await checkUserExistsByEmail(email);
        
        if (userExists) {
            // Before advancing, check if this email is a Google account to avoid confusion
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (methods.includes(GoogleAuthProvider.PROVIDER_ID)) {
                toast({ title: "Use Google Sign-In", description: "This email is linked to a Google account. Please use the 'Continue with Google' button.", duration: 7000 });
                return;
            }
            setStep(2);
        } else {
            setEmailError("No account found. Please sign up first.");
            emailInputRef.current?.focus();
        }
      } catch (error) {
        console.error("Error checking user existence:", error);
        setEmailError("An error occurred. Please try again.");
      }
      
      setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Logo className="w-8 h-8" />
                <h1 className="font-headline font-semibold text-2xl">RequestFlow</h1>
            </div>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
            {!isFirebaseConfigured && (
            <Alert variant="destructive" className="mb-4">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                Your Firebase environment variables are not set. Please copy them from your `.env` file.
                </AlertDescription>
            </Alert>
            )}
            
            {step === 1 ? (
                <div className="space-y-4">
                    <Button className="w-full" variant="outline" onClick={handleGoogleLogin} disabled={loading || !isFirebaseConfigured}>
                        {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                        Continue with Google
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); handleContinue(e as any); }}>
                        <div className="space-y-1">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            placeholder="you@example.com" 
                            required 
                            value={email} 
                            onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                            disabled={loading || !isFirebaseConfigured} 
                            ref={emailInputRef}
                            className={cn(emailError && "border-destructive focus-visible:ring-destructive")}
                          />
                          {emailError && <p className="text-sm font-medium text-destructive">{emailError}</p>}
                        </div>
                        <Button className="w-full" type="submit" disabled={loading || !isFirebaseConfigured || !email}>
                            {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Continue
                        </Button>
                    </form>
                </div>
            ) : (
                <div className="space-y-4">
                    <button onClick={() => { setStep(1); setPassword(''); }} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
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
             )}
        </CardContent>
         <CardFooter className="flex flex-col gap-4 pt-4">
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
