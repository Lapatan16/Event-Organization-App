import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { API_URL } from '../services/config';


type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

  // Fetch user once on app start
  useEffect(() => {
    const fetchUser = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await fetchWithAuth(`${API_URL}/api/User/me`, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    fetchUser();
}, []);

  return <UserContext.Provider value={{ user, setUser, loading }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
