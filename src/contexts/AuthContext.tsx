import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, isDevelopmentMode } from '@/lib/firebase';
import { 
  storeUser, 
  getStoredUser, 
  findUserByEmail, 
  setCurrentUser, 
  getCurrentUser 
} from '@/lib/localStorage';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'artisan';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string, role?: 'user' | 'artisan') => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'user' | 'artisan') => Promise<void>;
  signInWithGoogle: (role?: 'user' | 'artisan') => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // First check localStorage for user data
        let userData = getStoredUser(firebaseUser.uid);
        
        if (userData) {
          // Use stored user data
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || userData.name || '',
            avatar: firebaseUser.photoURL || userData.avatar || undefined,
            role: userData.role || 'user'
          });
        } else if (!isDevelopmentMode) {
          // Only try Firestore in production
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const firestoreData = userDoc.data();
              const user = {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || firestoreData.name || '',
                avatar: firebaseUser.photoURL || firestoreData.avatar || undefined,
                role: firestoreData.role || 'user'
              };
              setUser(user);
              // Store in localStorage for future use
              storeUser(firebaseUser.uid, user);
            } else {
              // Create basic user profile
              const user = {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || '',
                avatar: firebaseUser.photoURL || undefined,
                role: 'user' as const
              };
              setUser(user);
              storeUser(firebaseUser.uid, user);
            }
          } catch (error) {
            console.warn('Firestore error, using basic profile:', error);
            const user = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || '',
              avatar: firebaseUser.photoURL || undefined,
              role: 'user' as const
            };
            setUser(user);
            storeUser(firebaseUser.uid, user);
          }
        } else {
          // Development mode - use basic profile
          const user = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || '',
            avatar: firebaseUser.photoURL || undefined,
            role: 'user' as const
          };
          setUser(user);
          storeUser(firebaseUser.uid, user);
        }
      } else {
        setUser(null);
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, role: 'user' | 'artisan' = 'user'): Promise<void> => {
    try {
      setIsLoading(true);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check role from localStorage first
      const storedUser = getStoredUser(credential.user.uid);
      if (storedUser && storedUser.role !== role) {
        await firebaseSignOut(auth);
        throw new Error(`This account is registered as ${storedUser.role}, not ${role}`);
      }
      
      // Only check Firestore in production if localStorage doesn't have role info
      if (!isDevelopmentMode && !storedUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role !== role) {
              await firebaseSignOut(auth);
              throw new Error(`This account is registered as ${userData.role}, not ${role}`);
            }
          }
        } catch (firestoreError) {
          console.warn('Could not verify user role from Firestore:', firestoreError);
          // Continue with sign-in even if Firestore check fails
        }
      }
      
      toast.success('Successfully signed in!');
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'user' | 'artisan' = 'user'): Promise<void> => {
    try {
      setIsLoading(true);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile
      await updateProfile(credential.user, {
        displayName: name
      });

      // Create user data object
      const userData = {
        id: credential.user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        avatar: null
      };

      // Always store in localStorage first
      storeUser(credential.user.uid, userData);

      // Only try Firestore in production
      if (!isDevelopmentMode) {
        try {
          await setDoc(doc(db, 'users', credential.user.uid), userData);
        } catch (firestoreError) {
          console.warn('Could not save user data to Firestore:', firestoreError);
          // Continue - localStorage has the data
        }
      }

      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (role: 'user' | 'artisan' = 'user'): Promise<void> => {
    try {
      setIsLoading(true);
      const credential = await signInWithPopup(auth, googleProvider);
      
      try {
        // Check if user already exists
        const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
        
        if (!userDoc.exists()) {
          // Create new user document
          await setDoc(doc(db, 'users', credential.user.uid), {
            name: credential.user.displayName || '',
            email: credential.user.email || '',
            role,
            createdAt: new Date().toISOString(),
            avatar: credential.user.photoURL || null
          });
        } else {
          // Check role for existing users
          const userData = userDoc.data();
          if (userData.role !== role) {
            await firebaseSignOut(auth);
            throw new Error(`This account is registered as ${userData.role}, not ${role}`);
          }
        }
      } catch (firestoreError) {
        console.warn('Could not access Firestore for Google sign-in:', firestoreError);
        // Continue with Google sign-in even if Firestore operations fail
      }
      
      toast.success('Successfully signed in with Google!');
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Sign out failed');
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
    signUp,
    signInWithGoogle,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};