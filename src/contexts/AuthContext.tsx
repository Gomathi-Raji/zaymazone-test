import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authApi, setAuthToken, getAuthToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
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

  const signIn = async (email: string, password: string): Promise<void> => {
    const res = await authApi.signIn({ email, password });
    setAuthToken(res.token);
    setUser({ id: res.user.id, email: res.user.email, name: res.user.name });
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    const res = await authApi.signUp({ email, password, name });
    setAuthToken(res.token);
    setUser({ id: res.user.id, email: res.user.email, name: res.user.name });
  };

  const signOut = (): void => {
    setAuthToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    signIn,
    signOut,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};