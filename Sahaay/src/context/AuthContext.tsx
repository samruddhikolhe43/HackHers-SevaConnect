import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
  avatar?: string;
  title?: string;
  badge?: string;
  verificationStatus?: string;
  skills?: string[];
  experience?: string;
  orgRegNumber?: string;
  serviceArea?: string;
  trainingCompleted?: boolean;
  trainingQuizScore?: number;
  safetyTier?: string;
  isDemo?: boolean;
  createdAt?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  city?: string;
  skills?: string[];
  experience?: string;
  orgRegNumber?: string;
  serviceArea?: string;
}

export const GUEST_USER: UserAccount = {
  id: 'guest',
  name: 'Guest Citizen',
  email: 'guest@sahaay.org',
  role: 'public',
  title: 'Community Member',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  city: 'Pune',
  isDemo: false,
};

export const DEMO_PRESETS: Record<UserRole, UserAccount> = {
  public: GUEST_USER,
  citizen: {
    id: 'cit-001',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role: 'citizen',
    title: 'Active Citizen Reporter',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    badge: 'Civic Guardian Level 2',
    city: 'Pune',
    isDemo: true,
  },
  worker: {
    id: 'wrk-101',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    role: 'worker',
    title: 'Certified Community Service Worker',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    badge: 'Certified Tier 2 Handler',
    city: 'Nagpur',
    isDemo: true,
  },
  organisation: {
    id: 'org-admin-1',
    name: 'Dr. Sunita Kulkarni',
    email: 'coordinator@sahaaytrust.org',
    role: 'organisation',
    title: 'Field Operations Coordinator (Sahaay Partner NGO)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    badge: 'Registered Welfare Organisation',
    city: 'Nagpur & Pune',
    isDemo: true,
  },
};

interface AuthContextType {
  role: UserRole;
  user: UserAccount;
  token: string | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  isWorkerAvailable: boolean;
  toggleWorkerAvailability: () => void;
  setWorkerAvailability: (status: boolean) => void;
  switchRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  loginAsDemo: (role: UserRole) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => void;
  updateUser: (fields: Partial<UserAccount>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('sahaay_token');
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const savedUser = localStorage.getItem('sahaay_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        // Fall back
      }
    }
    return GUEST_USER;
  });

  const [role, setRole] = useState<UserRole>(() => {
    if (currentUser && currentUser.role) {
      return currentUser.role;
    }
    return 'public';
  });

  const [isWorkerAvailable, setIsWorkerAvailable] = useState<boolean>(() => {
    const saved = localStorage.getItem('sahaay_worker_available');
    return saved !== null ? saved === 'true' : true;
  });

  // Verify and sync user session on mount if token exists
  useEffect(() => {
    if (!token) return;

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid token');
        }
        return res.json();
      })
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setRole(data.user.role);
          localStorage.setItem('sahaay_user', JSON.stringify(data.user));
          localStorage.setItem('sahaay_role', data.user.role);
        }
      })
      .catch(() => {
        // If server /api/auth/me rejected or server restarting, retain cached user if present
      });
  }, [token]);

  useEffect(() => {
    localStorage.setItem('sahaay_worker_available', String(isWorkerAvailable));
  }, [isWorkerAvailable]);

  // Real Login
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed. Please check credentials.' };
      }

      setToken(data.token);
      setCurrentUser(data.user);
      setRole(data.user.role);
      localStorage.setItem('sahaay_token', data.token);
      localStorage.setItem('sahaay_user', JSON.stringify(data.user));
      localStorage.setItem('sahaay_role', data.user.role);

      return { success: true, role: data.user.role as UserRole };
    } catch {
      return { success: false, error: 'Could not connect to authentication server. Please check backend.' };
    }
  };

  // Real Register
  const register = async (payload: RegisterPayload) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      setToken(data.token);
      setCurrentUser(data.user);
      setRole(data.user.role);
      localStorage.setItem('sahaay_token', data.token);
      localStorage.setItem('sahaay_user', JSON.stringify(data.user));
      localStorage.setItem('sahaay_role', data.user.role);

      return { success: true, role: data.user.role as UserRole };
    } catch {
      return { success: false, error: 'Could not connect to registration server. Please try again.' };
    }
  };

  // Separate Demo Login
  const loginAsDemo = async (demoRole: UserRole) => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: demoRole }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setToken(data.token);
        setCurrentUser(data.user);
        setRole(data.user.role);
        localStorage.setItem('sahaay_token', data.token);
        localStorage.setItem('sahaay_user', JSON.stringify(data.user));
        localStorage.setItem('sahaay_role', data.user.role);
        return { success: true, role: data.user.role as UserRole };
      }
    } catch {
      // Fallback to client demo presets if server offline
    }

    const fallbackUser = DEMO_PRESETS[demoRole] || DEMO_PRESETS.public;
    setCurrentUser(fallbackUser);
    setRole(demoRole);
    localStorage.setItem('sahaay_user', JSON.stringify(fallbackUser));
    localStorage.setItem('sahaay_role', demoRole);
    return { success: true, role: demoRole };
  };

  // Role Switching: only allowed for Demo personas or Public visitors
  const switchRole = (newRole: UserRole) => {
    if (currentUser.isDemo || role === 'public') {
      loginAsDemo(newRole);
    } else {
      console.warn('Authenticated real user cannot spoof role via switchRole. Please sign in as appropriate account.');
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(GUEST_USER);
    setRole('public');
    localStorage.removeItem('sahaay_token');
    localStorage.removeItem('sahaay_user');
    localStorage.setItem('sahaay_role', 'public');
  };

  const updateUser = (fields: Partial<UserAccount>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...fields };
      localStorage.setItem('sahaay_user', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleWorkerAvailability = () => {
    const next = !isWorkerAvailable;
    setIsWorkerAvailable(next);
    if (token && role === 'worker') {
      fetch('/api/workers/availability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: next }),
      }).catch(err => console.error('Failed to sync worker availability with backend:', err));
    }
  };

  const setWorkerAvailability = (status: boolean) => {
    setIsWorkerAvailable(status);
    if (token && role === 'worker') {
      fetch('/api/workers/availability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: status }),
      }).catch(err => console.error('Failed to sync worker availability with backend:', err));
    }
  };

  const isAuthenticated = role !== 'public' && currentUser.id !== 'guest';
  const isDemo = Boolean(currentUser.isDemo);

  return (
    <AuthContext.Provider
      value={{
        role,
        user: currentUser,
        token,
        isAuthenticated,
        isDemo,
        isWorkerAvailable,
        toggleWorkerAvailability,
        setWorkerAvailability,
        switchRole,
        login,
        loginAsDemo,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
