import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../../services/api/client';

export type Role = 'admin' | 'delhi' | 'finance';

type User = {
  email: string;
  role: Role | null;
};

type AuthContextValue = {
  user: User | null;
  isCheckingAuth: boolean;
  isAdmin: boolean;
  canCreate: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .get('/auth/me')
      .then((response) => {
        if (isMounted) {
          setUser(response.data.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    setUser(response.data.data);
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isCheckingAuth,
      isAdmin: user?.role === 'admin',
      canCreate: user?.role === 'admin' || user?.role === 'delhi',
      login,
      logout,
    }),
    [user, isCheckingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
