// src/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authStorage } from "./storage";
import { fetchMeApi, loginApi, type MeResponse } from "../api/auth";
import { ApiError } from "../api/client";

type AuthState = {
  isReady: boolean; // 起動時に token復元を試みたか
  user: MeResponse | null;
  token: string | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isReady: false,
    user: null,
    token: authStorage.getToken(),
  });

  const logout = () => {
    authStorage.clearToken();
    setState((prev) => ({ ...prev, user: null, token: null }));
  };

  const refreshMe = async () => {
    const token = authStorage.getToken();
    if (!token) {
      setState((prev) => ({ ...prev, user: null, token: null, isReady: true }));
      return;
    }

    try {
      const me = await fetchMeApi();
      setState((prev) => ({
        ...prev,
        user: me,
        token,
        isReady: true,
      }));
    } catch (e) {
      // tokenが失効/不正 → クリア
      if (e instanceof ApiError && e.status === 401) {
        logout();
      }
      setState((prev) => ({ ...prev, isReady: true }));
    }
  };

  const login = async (email: string, password: string) => {
    const res = await loginApi({ email, password });
    authStorage.setToken(res.accessToken);
    setState({
      isReady: true,
      user: res.user,
      token: res.accessToken,
    });
  };

  useEffect(() => {
    // 起動時：tokenがあれば /auth/me で復元
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, refreshMe }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
