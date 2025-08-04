

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { signupSchema } from './schema';
import { signupAction, completeOrgCreationAction } from './actions';
import { GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserById, createUserInFirestore } from '@/lib/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader, TriangleAlert } from 'lucide-react';
import { Logo, GoogleIcon } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);

  const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      organizationName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: SignupFormValues) => {
    if (!isFirebaseConfigured) return;

    setIsPending(true);
    signupAction(values)
      .then((result) => {
        if (result?.error) {
          toast({
            title: 'Signup Failed',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome!',
            description: 'Your account has been created. Please check your email to verify your account before logging in.',
            duration: 8000,
          });
          router.push('/login');
        }
      })
      .catch((err) => {
        console.error("Caught error in component:", err);
         toast({
            title: 'Signup Failed',
            description: 'An unexpected error occurred.',
            variant: 'destructive',
          });
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  const handleGoogleSignup = async () => {
    setIsPending(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const appUser = await getUserById(user.uid);
      
      if (appUser?.organizationId) {
          // If user exists and has an org, treat it as a login
          await refreshUser();
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          router.push('/dashboard');
          return;
      }
      
      if (!appUser) {
        // Create a shell user in Firestore if they don't exist at all
        await createUserInFirestore(user.uid, {
            name: user.displayName || 'New User',
            email: user.email || '',
            avatar: user.photoURL || '',
            role: 'Admin',
            status: 'active',
            activityIsPublic: false,
            organizationId: '', // To be filled in next step
            phone: ''
        });
      }

      // Proceed to step 2 for org creation
      form.setValue('name', user.displayName || '');
      form.setValue('email', user.email || '');
      setGoogleUser(user);
      setStep(2);
      
    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
           // Do nothing, user cancelled.
        } else {
             toast({
              title: 'Google Sign-up Failed',
              description: error.message || 'An unexpected error occurred.',
              variant: 'destructive',
            });
        }
    } finally {
        setIsPending(false);
    }
  };

  const onFinalGoogleSubmit = (values: SignupFormValues) => {
    if (!googleUser) {
        toast({ title: 'Error', description: 'Authentication session lost. Please try again.', variant: 'destructive'});
        setStep(1);
        return;
    }
    setIsPending(true);
    
    completeOrgCreationAction(googleUser.uid, values.organizationName)
        .then(async (result) => {
            if (result?.error) {
                 toast({
                    title: 'Signup Failed',
                    description: result.error,
                    variant: 'destructive',
                });
                return;
            }
            await refreshUser();
            toast({
              title: "Welcome!",
              description: "Your account and organization have been created."
            });
            router.push('/dashboard');
        })
        .catch((error) => {
            toast({
              title: 'Signup Failed',
              description: error.message,
              variant: 'destructive',
            });
        })
        .finally(() => setIsPending(false));
  };


  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Logo className="w-8 h-8" />
            <h1 className="font-headline font-semibold text-2xl">RequestFlow</h1>
          </div>
          <CardTitle>{step === 1 ? "Create an Account" : "Create your Organization"}</CardTitle>
          <CardDescription>{step === 1 ? "Get started by creating your account." : "Just one more step to get started."}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isFirebaseConfigured && (
            <Alert variant="destructive" className="mb-4">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Your Firebase environment variables are not set. Please copy them from your Firebase project settings into your `.env` file to enable signup.
              </AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Button className="w-full" variant="outline" onClick={handleGoogleSignup} disabled={isPending || !isFirebaseConfigured}>
                  {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                  Sign up with Google
              </Button>
              <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                      <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
                  </div>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Jane Doe" {...field} disabled={isPending || !isFirebaseConfigured} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Acme Inc." {...field} disabled={isPending || !isFirebaseConfigured} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@company.com" {...field} disabled={isPending || !isFirebaseConfigured} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    {...field}
                                    disabled={isPending || !isFirebaseConfigured}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isPending || !isFirebaseConfigured}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button className="w-full" type="submit" disabled={isPending || !isFirebaseConfigured}>
                    {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up & Create Organization
                  </Button>
                </form>
              </Form>
            </div>
          )}
          {step === 2 && (
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onFinalGoogleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Acme Inc." {...field} disabled={isPending || !isFirebaseConfigured} autoFocus />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                   <Button className="w-full" type="submit" disabled={isPending || !isFirebaseConfigured}>
                    {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Finish Signup
                  </Button>
                </form>
             </Form>
          )}

        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
