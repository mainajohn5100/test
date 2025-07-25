
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
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  refreshUser: async () => {},
  clearUser: () => {},
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
    const currentFbUser = auth.currentUser;
    // Force a token refresh if the user exists
    if (currentFbUser) {
        await currentFbUser.getIdToken(true);
    }
    setFirebaseUser(auth.currentUser); // This will re-set the firebaseUser state
    await fetchAppUser(auth.currentUser);
  }, [fetchAppUser]);
  
  const clearUser = useCallback(() => {
    setUser(null);
    setFirebaseUser(null);
  }, []);

  const value = { firebaseUser, user, loading, refreshUser, clearUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
