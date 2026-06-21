import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';

type User = {
  username: string;
  role: string;
};

const STAFF_TOKEN_KEY = 'staff_auth_token';
const STAFF_USER_KEY = 'staff_auth_user';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const clearLocalAuthData = () => {
    localStorage.removeItem(STAFF_TOKEN_KEY);
    localStorage.removeItem(STAFF_USER_KEY);
    localStorage.removeItem('staff_auth_timestamp');
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // Phục hồi session đăng nhập nếu chưa quá 30 phút
    const token = localStorage.getItem(STAFF_TOKEN_KEY);
    const storedUser = localStorage.getItem(STAFF_USER_KEY);
    const timestampStr = localStorage.getItem('staff_auth_timestamp');

    if (token && storedUser && timestampStr) {
      const timestamp = parseInt(timestampStr, 10);
      const isExpired = Date.now() - timestamp > 30 * 60 * 1000; // 30 phút
      if (!isExpired) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          // Gia hạn session thêm 30p kể từ thời điểm reload/hoạt động
          localStorage.setItem('staff_auth_timestamp', Date.now().toString());
        } catch (e) {
          clearLocalAuthData();
        }
      } else {
        clearLocalAuthData();
      }
    } else {
      clearLocalAuthData();
    }
    setIsAuthInitialized(true);
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem(STAFF_TOKEN_KEY, newToken);
    localStorage.setItem(STAFF_USER_KEY, JSON.stringify(userData));
    localStorage.setItem('staff_auth_timestamp', Date.now().toString());
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const token = localStorage.getItem(STAFF_TOKEN_KEY);
    if (token) {
      try {
        await fetch(getApiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Logout API failed:', error);
      }
    }
    clearLocalAuthData();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthInitialized, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
