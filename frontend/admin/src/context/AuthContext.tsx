// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Định nghĩa kiểu dữ liệu cho User
interface User {
  username: string;
  role: string;
}

const ADMIN_TOKEN_KEY = "admin_auth_token";
const ADMIN_USER_KEY = "admin_auth_user";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);

  // Kiểm tra token trong localStorage khi ứng dụng khởi chạy
  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const storedUser = localStorage.getItem(ADMIN_USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch {
        // Dọn dữ liệu phiên hỏng để vẫn vào được trang đăng nhập
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    }

    setIsAuthInitialized(true);
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAuthInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext dễ dàng hơn
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
}

// Default export for compatibility with different import styles
export default AuthContext;