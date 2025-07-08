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
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() } as AppUser);
      } else {
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
    await fetchAppUser(firebaseUser);
  }, [firebaseUser, fetchAppUser]);

  const value = { firebaseUser, user, loading, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
