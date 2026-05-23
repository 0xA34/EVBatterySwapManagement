import React, { createContext, useContext, useState, useEffect } from 'react';

// Hardcoded test user
const TEST_USER = {
  email: 'nhanvien@test.com',
  password: '123456',
  profile: {
    id: 1,
    name: 'Nhân viên Test',
    role: 'staff'
  }
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check local storage on initial load
    const storedUser = localStorage.getItem('employee_auth');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (email === TEST_USER.email && password === TEST_USER.password) {
      setUser(TEST_USER.profile);
      setIsAuthenticated(true);
      localStorage.setItem('employee_auth', JSON.stringify(TEST_USER.profile));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('employee_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
