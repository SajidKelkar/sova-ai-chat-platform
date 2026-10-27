import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { getProfile, normalizeProfile, type UserProfile } from '@/api/auth';
import { isAuthError } from '@/api/client';

type AuthStatus = 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: UserProfile | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  authError: string | null;
  checkAuth: () => Promise<boolean>;
  setUser: (user: UserProfile | null) => void;
  logoutFrontend: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('unauthenticated');
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const data = await getProfile();
      const profile = normalizeProfile(data);
      if (profile && (profile._id || profile.id || profile.email)) {
        setUser(profile);
        setStatus('authenticated');
        setAuthError(null);
        return true;
      }
      setUser(null);
      setStatus('unauthenticated');
      setAuthError(null);
      return false;
    } catch (err) {
      setUser(null);
      setStatus('unauthenticated');
      setAuthError(
        isAuthError(err)
          ? null
          : err instanceof Error
            ? err.message
            : 'Unable to verify your session. Please try again.',
      );
      return false;
    }
  }, []);

  const logoutFrontend = useCallback(() => {
    setUser(null);
    setStatus('unauthenticated');
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, status, isAuthenticated: status === 'authenticated', authError, checkAuth, setUser, logoutFrontend }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
