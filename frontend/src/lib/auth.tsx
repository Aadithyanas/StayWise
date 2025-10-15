"use client";

import { createContext, useContext, useEffect, useMemo, useState, PropsWithChildren } from 'react';

type User = { id: string; email: string; role: 'user' | 'admin' } | null;

type AuthContextValue = {
  user: User;
  token: string | null;
  login: (token: string, user: NonNullable<User>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      login: (t, u) => {
        setToken(t);
        setUser(u);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', t);
          localStorage.setItem('user', JSON.stringify(u));
        }
      },
      logout: () => {
        setToken(null);
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


