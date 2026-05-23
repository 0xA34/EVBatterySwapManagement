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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(STAFF_TOKEN_KEY);
    const storedUser = localStorage.getItem(STAFF_USER_KEY);

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(STAFF_TOKEN_KEY);
        localStorage.removeItem(STAFF_USER_KEY);
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setIsAuthInitialized(true);
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem(STAFF_TOKEN_KEY, newToken);
    localStorage.setItem(STAFF_USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(STAFF_TOKEN_KEY);
    localStorage.removeItem(STAFF_USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
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
