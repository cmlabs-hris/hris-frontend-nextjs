'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Definisikan tipe data untuk user
interface User {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Definisikan tipe data untuk context
interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

// Buat Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Buat Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Fungsi untuk simulasi login
  const login = (email: string) => {
    // --- LOGIKA SIMULASI ---
    // Nantinya, di sini kita akan memanggil API ke backend Laravel.
    // Untuk sekarang, kita tentukan peran berdasarkan email.
    if (email.toLowerCase() === 'admin@gmail.com') {
      setUser({ name: 'KroKrok', email: email, role: 'admin' });
      router.push('/dashboard');
    } else if (email.includes('@')) { // email lain adalah user biasa
      setUser({ name: 'John Doe', email: email, role: 'user' });
      router.push('/dashboard');
    } else {
      // Simulasi jika login gagal
      alert('Email atau password salah!');
    }
  };

  // Fungsi untuk logout
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

// Buat custom hook untuk mempermudah penggunaan context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
