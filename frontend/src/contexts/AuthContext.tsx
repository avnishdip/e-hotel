import React, { createContext, useState } from 'react';
import axios from '../utils/axios';

interface User {
  id: string;
  email: string;
  role: 'customer' | 'employee';
  position?: string;
}

interface RegistrationData {
  full_name: string;
  email: string;
  password: string;
  address: string;
  id_type?: string;
  id_number?: string;
  credit_card_number?: string;
  ssn?: string;
  position?: string;
  salary?: number;
  hotel_id?: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  register: (data: RegistrationData, role: 'customer' | 'employee') => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));

  const login = async (email: string, password: string, role: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password, role });
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegistrationData, role: 'customer' | 'employee') => {
    try {
      const response = await axios.post(`/api/auth/register/${role}`, data);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
