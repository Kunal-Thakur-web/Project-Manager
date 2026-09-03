import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/auth.api";
import { tokenStore } from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    if (!tokenStore.getAccessToken()) {
      setInitializing(false);
      return;
    }
    try {
      const { data } = await authApi.getCurrentUser();
      setUser(data.data);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const { user: loggedInUser, accessToken, refreshToken } = data.data;
    tokenStore.setTokens(accessToken, refreshToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return data.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // even if the request fails, clear the local session
    }
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, initializing, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
