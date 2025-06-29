'use client';

import React, {createContext, useEffect, useState} from "react";
import axios from "@/lib/axios";
import {usePathname, useRouter} from "next/navigation";
import {toast} from "sonner";

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
  fetchUser: async () => {
  },
  logIn: async () => {
  },
  logOut: async () => {
  },
});

function AuthContextProvider({children}: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      if (localStorage.getItem('user')) {
        setUser(JSON.parse(localStorage.getItem('user')!))
      } else {
        const response = await axios.get('/api/v1/me');
        localStorage.setItem('user', JSON.stringify(response.data.data))
        setUser(response.data.data);
      }
      setIsLoggedIn(true);
    } catch (e: unknown) {
      toast.error((e as Error).message);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, password: string, remember = false) => {
    await axios.get('/sanctum/csrf-cookie');
    await axios.post('/api/v1/login', {email, password, remember});
    await fetchUser();
    router.push('/dashboard');
  }

  const logOut = async () => {
    await axios.delete('/api/v1/logout').then(() => {
      localStorage.removeItem('user');
      fetchUser();
    });
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (isLoggedIn && user && (pathname === '/login' || pathname === '/register')) {
      router.push('/dashboard');
    }

    if (!loading && !user) {
      if (pathname === '/register') {
        router.push(pathname);
      } else {
        router.push('/login');
      }
    }
  }, [loading, user, isLoggedIn, pathname, router]);

  if (loading) {
    return <></>
  }

  return (
    <AuthContext.Provider value={{loading, isLoggedIn, user, fetchUser, logIn, logOut}}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
