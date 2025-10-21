'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'superadmin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = (email: string) => {
    if (email.toLowerCase() === 'superadmin@gmail.com') {
      setUser({ name: 'Super Admin', email: email, role: 'superadmin' });
      router.push('/dashboard');
    } else if (email.toLowerCase() === 'admin@gmail.com') {
      setUser({ name: 'Admin', email: email, role: 'admin' });
      router.push('/dashboard');
    } else if (email.includes('@')) {
      setUser({ name: 'John Doe', email: email, role: 'user' });
      router.push('/dashboard');
    } else {
      alert('Email atau password salah!');
    }
  };

  const logout = () => {
    setUser(null);
    router.push('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

