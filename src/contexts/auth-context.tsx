'use client';

import React, {createContext, useEffect, useState, useRef} from "react";
import axios from "@/lib/axios";
import {usePathname, useRouter} from "next/navigation";

export interface MeResponse {
  data: User;
  message: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  loading: boolean;
  isLoggedIn: boolean;
  user: User | null;
  fetchUser: () => Promise<void>;
  logIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  logOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  loading: true,
  isLoggedIn: false,
  user: null,
  fetchUser: async () => {},
  logIn: async () => {},
  logOut: async () => {},
});

function AuthContextProvider({children}: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Use ref to track if logout is in progress
  const isLoggingOut = useRef(false);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/v1/me');

      const userData = response.data.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      setUser(userData);
      setIsLoggedIn(true);
    } catch (e: unknown) {
      console.log((e as Error).message);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logIn = async (email: string, password: string, remember = false) => {
    try {
      await axios.get('/sanctum/csrf-cookie');
      await axios.post('/api/v1/login', {email, password, remember});
      await fetchUser();
      router.replace('/');
    } catch (error) {
      throw error; // Re-throw so the login form can handle it
    }
  }

  const logOut = async () => {
    try {
      await axios.delete('/api/v1/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    // Clear state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    setUser(null);
    setIsLoggedIn(false);

    // Use window.location instead of router to avoid React hooks issues during logout
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Only handle redirecting authenticated users from auth pages
  useEffect(() => {
    if (loading || isLoggingOut.current) return;

    // Only redirect authenticated users away from login/register pages
    if (isLoggedIn && user && (pathname === '/login' || pathname === '/register')) {
      router.replace('/');
    }
  }, [loading, isLoggedIn, user, pathname, router]);

  if (loading) {
    return <></>; // We can render some progress bar later
  }

  return (
    <AuthContext.Provider value={{loading, isLoggedIn, user, fetchUser, logIn, logOut}}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
