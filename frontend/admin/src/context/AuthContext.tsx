  }

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
      setIsAuthenticated(true);
    }
  }, []);

      setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
      {children}
    </AuthContext.Provider>
  );
};

  const context = useContext(AuthContext);
  if (context === undefined) {
  }
  return context;
