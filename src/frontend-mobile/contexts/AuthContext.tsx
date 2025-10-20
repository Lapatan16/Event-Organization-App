import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { getItemAsync, setItemAsync, deleteItemAsync } from '../utils/SecureStore';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  avatar: string;
}

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  role: string | null;
  userInfo: UserInfo | null;
  loadingUserInfo: boolean;
  loadingTokens: boolean;
  login: (data: { accessToken: string; refreshToken: string; userId: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const router = useRouter();

  // Load tokens at startup
  useEffect(() => {
    const loadTokens = async () => {
      const storedAccessToken = await getItemAsync('accessToken');
      const storedRefreshToken = await getItemAsync('refreshToken');
      const storedUserId = await getItemAsync('userId');
      const storedRole = await getItemAsync('role');

      if (storedAccessToken && storedRefreshToken && storedUserId && storedRole) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setUserId(storedUserId);
        setRole(storedRole);
      }
      setLoadingTokens(false);
    };
    loadTokens();
  }, []);

  const refreshUserInfo = async () => {
    if (!accessToken) {
      setUserInfo(null);
      return;
    }
    setLoadingUserInfo(true);
    try {
      const res = await fetch(`${API_URL}/api/User/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user info');
      const user = await res.json();
      setUserInfo(user);
    } catch {
      setUserInfo(null);
    } finally {
      setLoadingUserInfo(false);
    }
  };

  useEffect(() => {
    if (accessToken) refreshUserInfo();
    else setUserInfo(null);
  }, [accessToken]);

  const login = async ({
    accessToken,
    refreshToken,
    userId,
    role,
  }: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    role: string;
  }) => {
    await setItemAsync('accessToken', accessToken);
    await setItemAsync('refreshToken', refreshToken);
    await setItemAsync('userId', userId);
    await setItemAsync('role', role);

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUserId(userId);
    setRole(role);

    await refreshUserInfo();
  };

  const logout = async () => {
    await deleteItemAsync('accessToken');
    await deleteItemAsync('refreshToken');
    await deleteItemAsync('userId');
    await deleteItemAsync('role');

    setAccessToken(null);
    setRefreshToken(null);
    setUserId(null);
    setRole(null);
    setUserInfo(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        userId,
        role,
        userInfo,
        loadingUserInfo,
        loadingTokens,
        login,
        logout,
        refreshUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
