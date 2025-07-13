'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/data';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = useCallback(async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as AppUser);
        } else {
          // This case can happen if the user exists in Auth but not in Firestore.
          // This might be a sign of an incomplete signup.
          console.warn("User exists in Firebase Auth but not in Firestore.", fbUser.uid);
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching app user from Firestore:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      await fetchAppUser(fbUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchAppUser]);
  
  const refreshUser = useCallback(async () => {
    // Re-fetch the currently signed-in user from auth to ensure it's fresh
    const currentFbUser = auth.currentUser;
    setFirebaseUser(currentFbUser);
    await fetchAppUser(currentFbUser);
  }, [fetchAppUser]);

  const value = { firebaseUser, user, loading, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
