import React, { createContext, useContext, useEffect, useState } from 'react';
import { watchAuthState, getUserProfile } from '../firebase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = watchAuthState(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const p = await getUserProfile(firebaseUser.uid);
          setProfile(p);
        } catch (err) {
          console.error('Could not load user profile', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Periodically checks if the user's email got verified elsewhere (e.g. they
  // clicked the link in another tab) and refreshes their auth token so
  // Firestore rules immediately recognize the new verified status.
  useEffect(() => {
    if (!user || user.emailVerified) return;

    const checkVerification = async () => {
      try {
        await user.reload();
        if (user.emailVerified) {
          await user.getIdToken(true); // force a fresh token with the updated claim
          setUser({ ...user }); // trigger a re-render so the UI updates immediately
        }
      } catch (err) {
        console.error('Could not check verification status', err);
      }
    };

    const interval = setInterval(checkVerification, 5000);
    window.addEventListener('focus', checkVerification);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkVerification);
    };
  }, [user]);

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}