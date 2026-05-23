import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io } from "socket.io-client";

// Define custom types to replace Supabase types
type User = { id: string; _id?: string; email?: string; username?: string; avatarUrl?: string; };
type Session = { user: User | null; };

export interface UserProfile {
  balance: number;
  vip_level: number;
  tasks_completed_today: number;
  combo_slots?: number[];
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (userData: User) => void; // Add login function to the context
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialAuthCheckComplete, setIsInitialAuthCheckComplete] = useState(false);

  const login = (userData: any) => {
    const normalizedUser = {
      ...userData,
      id: userData.id || userData._id,
      _id: userData._id || userData.id,
    };
    setUser(normalizedUser);
    setSession({ user: normalizedUser });
    localStorage.setItem('auth-user', JSON.stringify(normalizedUser)); // Save to localStorage
  };

  const checkAdminRole = async (userId: string) => {
    // This will be implemented later with our backend
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    // This will be implemented later with our backend
  };

  const checkApiReachability = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/health`);
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    // Bootstrap test for MongoDB connection
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      fetch(`${apiUrl}/api/test-db`, { mode: 'cors' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('✅ MongoDB Bootstrap Test: Connection Successful');
          } else {
            console.warn('⚠️ Backend responded but Database is not ready:', data.message);
          }
        })
        .catch(() => {
          // Silence the console error to avoid browser security warnings on error pages
          // and only log a friendly status message.
          console.info('ℹ️ Backend server at http://localhost:3001 is currently unreachable.');
        });
    }

    // The original Supabase auth logic is removed.
    // We will build our own session management logic here later.
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('auth-user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const normalizedUser = {
            ...userData,
            id: userData.id || userData._id,
            _id: userData._id || userData.id,
          };
          setUser(normalizedUser);
          setSession({ user: normalizedUser });
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('auth-user');
      }
      setLoading(false);
      setIsInitialAuthCheckComplete(true);
    };

    initializeAuth();
  }, []);

  // Real-time listener for profile changes (Equivalent to Socket.io)
  useEffect(() => {
    if (!user) return;

    // Establish Socket.io connection for MongoDB real-time updates
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3001");

    socket.on("connect", () => {
      // Join a private room to receive personal updates securely
      socket.emit("join-room", user.id);
    });

    // Listen for updates pushed to the private room
    socket.on("profile-update", (updatedFields) => {
      setProfile((prev) => (prev ? { ...prev, ...updatedFields } : null));
    });

    socket.on("connect_error", (err) => {
      console.error("MongoDB Socket connection failed:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const signOut = async () => {
    // This will be implemented later with our backend
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setProfile(null);
    localStorage.removeItem('auth-user'); // Clear from localStorage
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isAdmin, loading, login, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};