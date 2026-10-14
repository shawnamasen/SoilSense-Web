import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  linkWithPopup,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, firebaseConfigured, googleProvider } from '../../services/firebase';

const AuthContext = createContext(null);

function createAuthError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function requireFirebase() {
  if (!firebaseConfigured || !auth || !db) {
    throw createAuthError('auth/firebase-not-configured', 'Firebase is not configured.');
  }
}

async function buildVerifiedAdmin(firebaseUser) {
  if (!firebaseUser) return null;
  await firebaseUser.reload();
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  if (!currentUser.emailVerified) {
    throw createAuthError('auth/email-not-verified', 'Verify your email before signing in.');
  }

  const profileSnapshot = await getDoc(doc(db, 'users', currentUser.uid));
  if (!profileSnapshot.exists()) {
    throw createAuthError('auth/admin-profile-missing', 'This account does not have a SoilSense administrator profile.');
  }
  const profile = profileSnapshot.data() || {};
  if (profile.active !== true || String(profile.role || '').toLowerCase() !== 'admin') {
    throw createAuthError('auth/not-admin', 'This account is not an active SoilSense administrator.');
  }

  return {
    uid: currentUser.uid,
    name: profile.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Administrator',
    email: profile.email || currentUser.email || '',
    photoURL: currentUser.photoURL || null,
    emailVerified: currentUser.emailVerified,
    role: 'admin',
    active: true,
    provider: currentUser.providerData?.[0]?.providerId || 'password',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Prevent the auth observer from rejecting a newly-created account before signup has signed it out.
  const authOperation = useRef(false);

  useEffect(() => {
    if (!firebaseConfigured || !auth || !db) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (authOperation.current) return;
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const adminUser = await buildVerifiedAdmin(firebaseUser);
        if (active && auth.currentUser?.uid === firebaseUser.uid) setUser(adminUser);
      } catch (error) {
        // Access is denied without displaying internal authentication details.
        if (active) setUser(null);
        // A signed-in Firebase user is not necessarily an authorized administrator.
        if (auth.currentUser?.uid === firebaseUser.uid) {
          await firebaseSignOut(auth).catch(() => undefined);
        }
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!user?.uid || !auth || !db) return undefined;
    let active = true;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), snapshot => {
      if (!active) return;
      const profile = snapshot.exists() ? snapshot.data() : null;
      if (!profile || profile.active !== true || String(profile.role || '').toLowerCase() !== 'admin') {
        setUser(null);
        void firebaseSignOut(auth).catch(() => undefined);
      }
    }, error => {
      // Fail closed when current admin role cannot be verified.
      // Do not keep an admin UI open if role cannot be verified.
      if (active) {
        setUser(null);
        void firebaseSignOut(auth).catch(() => undefined);
      }
    });
    return () => { active = false; unsubscribe(); };
  }, [user?.uid]);

  const refreshSession = useCallback(async () => {
    if (!auth?.currentUser) {
      setUser(null);
      return null;
    }
    try {
      const adminUser = await buildVerifiedAdmin(auth.currentUser);
      setUser(adminUser);
      return adminUser;
    } catch (error) {
      setUser(null);
      return null;
    }
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    requireFirebase();
    authOperation.current = true;
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const adminUser = await buildVerifiedAdmin(credential.user);
      setUser(adminUser);
      return adminUser;
    } catch (error) {
      await firebaseSignOut(auth).catch(() => undefined);
      setUser(null);
      throw error;
    } finally {
      authOperation.current = false;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    requireFirebase();
    if (!googleProvider) throw createAuthError('auth/google-not-configured', 'Google Authentication is not configured.');
    authOperation.current = true;
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const adminUser = await buildVerifiedAdmin(credential.user);
      setUser(adminUser);
      return adminUser;
    } catch (error) {
      await firebaseSignOut(auth).catch(() => undefined);
      setUser(null);
      throw error;
    } finally {
      authOperation.current = false;
    }
  }, []);

  // Signup creates Firebase Auth credentials only. It does not grant an admin role.
  // An existing authorized administrator must provision the account's /users/{uid}
  // profile through an authorized channel before it can enter the dashboard.
  const signup = useCallback(async ({ name, email, password }) => {
    requireFirebase();
    authOperation.current = true;
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await sendEmailVerification(credential.user);
      } catch (error) {
        throw createAuthError('auth/verification-send-failed',
          'The account was created, but the verification email could not be sent. Contact your administrator.');
      }
      return { name, email, uid: credential.user.uid };
    } finally {
      // Firebase automatically signs in on account creation. Never treat signup as admin login.
      await firebaseSignOut(auth).catch(() => undefined);
      setUser(null);
      authOperation.current = false;
    }
  }, []);

  // An already-approved email/password admin may safely link Google to that SAME UID.
  // This prevents a separate Google credential from looking like an unapproved new admin.
  const linkGoogleToCurrentAdmin = useCallback(async () => {
    requireFirebase();
    if (!user?.uid || !auth.currentUser || auth.currentUser.uid !== user.uid) {
      throw createAuthError('auth/not-admin', 'Sign in as an approved administrator before linking Google.');
    }
    if (auth.currentUser.providerData?.some(provider => provider.providerId === 'google.com')) {
      return { alreadyLinked: true };
    }
    await linkWithPopup(auth.currentUser, googleProvider);
    return { alreadyLinked: false };
  }, [user?.uid]);

  const logout = useCallback(async () => {
    if (auth) await firebaseSignOut(auth).catch(() => undefined);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    firebaseConfigured,
    loginWithEmail,
    loginWithGoogle,
    signup,
    linkGoogleToCurrentAdmin,
    logout,
    refreshSession,
  }), [user, loading, loginWithEmail, loginWithGoogle, signup, linkGoogleToCurrentAdmin, logout, refreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
