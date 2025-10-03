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
import { auth, googleProvider } from '@/lib/firebase';
import { firebaseAuthApi, setFirebaseToken, getFirebaseToken, User as ApiUser } from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'artisan';
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
    language: string;
  };
  isEmailVerified?: boolean;
  authProvider?: 'firebase' | 'local';
  firebaseUid?: string;
  lastLogin?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string, role?: 'user' | 'artisan') => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'user' | 'artisan') => Promise<void>;
  signInWithGoogle: (role?: 'user' | 'artisan') => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateUserProfile: (profileData: { 
    name?: string; 
    phone?: string; 
    address?: Partial<User['address']>; 
    preferences?: Partial<User['preferences']>; 
  }) => Promise<void>;
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

  // Helper function to sync Firebase user with MongoDB
  const syncUserWithMongoDB = async (firebaseUser: FirebaseUser, role: 'user' | 'artisan' = 'user') => {
    try {
      const idToken = await firebaseUser.getIdToken();
      setFirebaseToken(idToken);
      
      const response = await firebaseAuthApi.syncUser({ idToken, role });
      const dbUser = response.user;
      
      const userProfile: User = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        role: dbUser.role as 'user' | 'artisan',
        phone: dbUser.phone,
        address: dbUser.address,
        preferences: dbUser.preferences,
        isEmailVerified: dbUser.isEmailVerified,
        authProvider: dbUser.authProvider,
        firebaseUid: dbUser.firebaseUid,
        lastLogin: dbUser.lastLogin,
        createdAt: dbUser.createdAt
      };
      
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Failed to sync user with MongoDB:', error);
      // Fallback to basic Firebase user data
      const basicUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        avatar: firebaseUser.photoURL || undefined,
        role: role,
        isEmailVerified: firebaseUser.emailVerified,
        authProvider: 'firebase',
        firebaseUid: firebaseUser.uid
      };
      setUser(basicUser);
      return basicUser;
    }
  };

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        await syncUserWithMongoDB(firebaseUser);
      } else {
        setUser(null);
        setFirebaseToken(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, role: 'user' | 'artisan' = 'user'): Promise<void> => {
    try {
      setIsLoading(true);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      
      // Sync with MongoDB and check role
      const dbUser = await syncUserWithMongoDB(credential.user, role);
      
      if (dbUser.role !== role) {
        await firebaseSignOut(auth);
        throw new Error(`This account is registered as ${dbUser.role}, not ${role}`);
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
      
      // Update Firebase user profile
      await updateProfile(credential.user, {
        displayName: name
      });

      // Sync with MongoDB
      await syncUserWithMongoDB(credential.user, role);

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
      
      // Sync with MongoDB and check role
      const dbUser = await syncUserWithMongoDB(credential.user, role);
      
      // For existing users, check if role matches
      if (dbUser.role !== role) {
        await firebaseSignOut(auth);
        throw new Error(`This account is registered as ${dbUser.role}, not ${role}`);
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
      setFirebaseToken(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Sign out failed');
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const updateUserProfile = async (profileData: { 
    name?: string; 
    phone?: string; 
    address?: Partial<User['address']>; 
    preferences?: Partial<User['preferences']>;
    avatar?: string;
  }): Promise<void> => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const firebaseToken = getFirebaseToken();
      if (!firebaseToken) {
        throw new Error('No authentication token found');
      }

      const response = await firebaseAuthApi.updateProfile(profileData, firebaseToken);
      const updatedUser = response.user;

      const userProfile: User = {
        ...user,
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
        preferences: updatedUser.preferences
      };

      setUser(userProfile);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
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
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};