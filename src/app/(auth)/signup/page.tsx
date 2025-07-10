
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { CalendarIcon, Loader, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/settings-context';
import type { User } from '@/lib/data';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return <svg role="img" viewBox="0 0 24 24" {...props}><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.73 1.9-4.27 0-7.75-3.5-7.75-7.75s3.48-7.75 7.75-7.75c2.43 0 3.86.95 4.73 1.82l2.73-2.73C18.74 1.04 15.97 0 12.48 0 5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c7.04 0 12.02-4.92 12.02-12.02 0-.8-.08-1.58-.2-2.32H12.48z"/></svg>
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
    return <svg role="img" viewBox="0 0 24 24" {...props}><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
}

const getFirebaseAuthErrorMessage = (error: any) => {
    if (error.code === 'auth/api-key-not-valid') {
        return "The provided Firebase API Key is invalid. Please double-check the value in your .env file and restart your development server.";
    }
    if (error.code === 'auth/email-already-in-use') {
        return 'This email address is already in use. Please try logging in instead.';
    }
    if (error.code === 'auth/weak-password') {
        return 'The password is too weak. Please use at least 6 characters.';
    }
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return 'Sign-up process was cancelled.';
    }
    return error.message || 'An unexpected error occurred. Please try again.';
};

const matchPattern = (email: string, pattern: string) => {
    if (!pattern) return false;
    const patterns = pattern.split(',').map(p => p.trim());
    for (const p of patterns) {
        if (p) {
            const regex = new RegExp('^' + p.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
            if (regex.test(email)) {
                return true;
            }
        }
    }
    return false;
};

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    adminEmailPattern, 
    agentEmailPattern, 
    agentSignupEnabled, 
    customerSignupEnabled,
    loading: settingsLoading 
  } = useSettings();
  
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [dob, setDob] = useState<Date | undefined>();
  const [gender, setGender] = useState('');

  const determineRole = useCallback((userEmail: string): User['role'] => {
    if (matchPattern(userEmail, adminEmailPattern)) {
        return 'Admin';
    }
    if (matchPattern(userEmail, agentEmailPattern)) {
        return 'Agent';
    }
    return 'Customer';
  }, [adminEmailPattern, agentEmailPattern]);


  const handleEmailSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const role = determineRole(email);

    if (role === 'Agent' && !agentSignupEnabled) {
        toast({ title: 'Signup Disabled', description: 'Agent account creation is currently disabled by the administrator.', variant: 'destructive' });
        setLoading(false);
        return;
    }
    if (role === 'Customer' && !customerSignupEnabled) {
        toast({ title: 'Signup Disabled', description: 'Customer account creation is currently disabled by the administrator.', variant: 'destructive' });
        setLoading(false);
        return;
    }


    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const initials = name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
      const avatar = `https://placehold.co/32x32/BDE0FE/4A4A4A.png?text=${initials}`;

      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name,
        email,
        role,
        avatar,
        phone: phone || null,
        country: country || null,
        city: city || null,
        zipCode: zipCode || null,
        dob: dob ? dob.toISOString() : null,
        gender: gender || null,
        activityIsPublic: false,
      });

      router.push('/dashboard');
      toast({
        title: 'Account Created',
        description: 'Welcome! Redirecting you to the dashboard.',
      });

    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: getFirebaseAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (providerName: 'google' | 'github') => {
    setLoading(true);
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email) {
          toast({ title: "Email required", description: "Your social account must have an email to sign up.", variant: "destructive"});
          setLoading(false);
          return;
      }

      const role = determineRole(user.email);
      if (role === 'Agent' && !agentSignupEnabled) {
          toast({ title: 'Signup Disabled', description: 'Agent account creation is currently disabled by the administrator.', variant: 'destructive' });
          setLoading(false);
          return;
      }
      if (role === 'Customer' && !customerSignupEnabled) {
          toast({ title: 'Signup Disabled', description: 'Customer account creation is currently disabled by the administrator.', variant: 'destructive' });
          setLoading(false);
          return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        const initials = user.displayName?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || '??';
        const avatar = user.photoURL || `https://placehold.co/32x32/BDE0FE/4A4A4A.png?text=${initials}`;
        
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          role: role,
          avatar,
          activityIsPublic: false,
        });
      }
      
      router.push('/dashboard');
      toast({
        title: 'Sign In Successful',
        description: `Welcome, ${user.displayName}!`,
      });

    } catch (error: any) {
      toast({
        title: 'Sign In Failed',
        description: getFirebaseAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (settingsLoading) {
      return (
         <div className="flex h-screen items-center justify-center bg-muted/40">
            <Loader className="h-8 w-8 animate-spin" />
        </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Logo className="w-8 h-8" />
                <h1 className="font-headline font-semibold text-2xl">RequestFlow</h1>
            </div>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => handleSocialSignIn('google')} disabled={loading || settingsLoading}>
                        <GoogleIcon className="mr-2 h-4 w-4" /> Google
                    </Button>
                    <Button variant="outline" onClick={() => handleSocialSignIn('github')} disabled={loading || settingsLoading}>
                        <GitHubIcon className="mr-2 h-4 w-4" /> GitHub
                    </Button>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        Or create an account with email
                        </span>
                    </div>
                </div>
                 <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={loading || settingsLoading}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading || settingsLoading} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input 
                                id="password" 
                                name="password" 
                                type={showPassword ? "text" : "password"} 
                                required 
                                minLength={6} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                disabled={loading || settingsLoading} 
                                className="pr-10"
                            />
                            <Button 
                                type="button" 
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
                    </div>
                    
                    <Separator />
                    <p className="text-sm text-muted-foreground">Optional Information</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading || settingsLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select onValueChange={setGender} value={gender} disabled={loading || settingsLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>Date of birth</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !dob && "text-muted-foreground"
                                    )}
                                    disabled={loading || settingsLoading}
                                    >
                                    {dob ? format(dob, "PPP") : ( <span>Pick a date</span> )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dob}
                                        onSelect={setDob}
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                        initialFocus
                                        captionLayout="dropdown-buttons"
                                        fromYear={1900}
                                        toYear={new Date().getFullYear()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} disabled={loading || settingsLoading} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} disabled={loading || settingsLoading} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="zipCode">Zip/Postal Code</Label>
                            <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} disabled={loading || settingsLoading} />
                        </div>
                    </div>

                    <Button className="w-full" type="submit" disabled={loading || settingsLoading}>
                        {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </form>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline hover:text-primary">
                Sign in
              </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
