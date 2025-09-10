import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    await auth.signOut();
    // State will be cleared by onAuthStateChanged listener
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserData({
              id: user.uid,
              email: data.email,
              name: data.name,
              role: data.role,
              department: data.department,
              status: data.status,
              createdAt: data.createdAt
            });
          } else {
            console.error('Authentication error: User data not found in database.');
            setUserData(null);
          }
        } catch (error) {
          console.error('Firebase error: Could not fetch user data.', error);
          setUserData(null);
        }
        // Set loading to false only after attempting to fetch and set user data.
        setLoading(false);
      } else {
        // If there is no user, clear user data and stop loading.
        setUserData(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signOut
  };

  // Render children only when not loading, or let ProtectedRoute handle it.
  // It's better to always render and let consumers decide what to do with the loading state.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
