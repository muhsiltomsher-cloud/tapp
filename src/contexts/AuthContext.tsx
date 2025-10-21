'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { IUser, LoginRequest, RegisterRequest, AuthResponse } from '@/types';

interface AuthContextType {
  user: Omit<IUser, 'password'> | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<IUser, 'password'> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    
    if (isDemoMode) {
      const mockUser = {
        _id: 'demo-user-id',
        name: 'Demo User',
        email: credentials.email,
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const mockToken = 'demo-token-' + Date.now();
      
      setToken(mockToken);
      setUser(mockUser);
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      router.push('/dashboard');
      return;
    }

    try {
      const response = await axios.post<AuthResponse>('/api/auth/login', credentials);

      if (response.data.success && response.data.token && response.data.user) {
        const { token: newToken, user: newUser } = response.data;
        
        setToken(newToken);
        setUser(newUser);
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        router.push('/dashboard');
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const register = async (data: RegisterRequest) => {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    
    if (isDemoMode) {
      const mockUser = {
        _id: 'demo-user-id',
        name: data.name,
        email: data.email,
        role: data.role || 'CLIENT_USER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const mockToken = 'demo-token-' + Date.now();
      
      setToken(mockToken);
      setUser(mockUser);
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      router.push('/dashboard');
      return;
    }

    try {
      const response = await axios.post<AuthResponse>('/api/auth/register', data);

      if (response.data.success && response.data.token && response.data.user) {
        const { token: newToken, user: newUser } = response.data;
        
        setToken(newToken);
        setUser(newUser);
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        router.push('/dashboard');
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
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
