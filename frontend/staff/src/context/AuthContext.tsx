import React, { createContext, useContext, useState, useEffect } from 'react';

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
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // Xóa bỏ token và thông tin người dùng khỏi storage khi ứng dụng khởi động để luôn yêu cầu đăng nhập lại
    clearLocalAuthData();
    setIsAuthInitialized(true);
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem(STAFF_TOKEN_KEY, newToken);
    localStorage.setItem(STAFF_USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const token = localStorage.getItem(STAFF_TOKEN_KEY);
    if (token) {
      try {
        await fetch('http://localhost:8080/api/auth/logout', {
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
