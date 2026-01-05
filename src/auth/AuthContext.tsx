/* eslint-disable react-refresh/only-export-components */
// src/auth/AuthContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { authStorage } from "./storage";
import { fetchMeApi, loginApi, type MeResponse } from "../api/auth";
import { ApiError } from "../api/client";

type AuthState = {
  isReady: boolean;
  user: MeResponse | null;
  token: string | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const initAuthState = (): AuthState => {
  const token = authStorage.getToken();
  return {
    isReady: token ? false : true,
    user: null,
    token,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => initAuthState());

  const logout = useCallback(() => {
    authStorage.clearToken();
    setState({ isReady: true, user: null, token: null });
  }, []);

  const refreshMe = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) {
      setState({ isReady: true, user: null, token: null });
      return;
    }

    try {
      const me = await fetchMeApi();
      setState({ isReady: true, user: me, token });
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        logout();
        return;
      }
      setState((prev) => ({ ...prev, isReady: true }));
    }
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi({ email, password });
    authStorage.setToken(res.accessToken);

    setState({
      isReady: true,
      user: res.user,
      token: res.accessToken,
    });
  }, []);

  if (!state.isReady && state.token) {
    setState((prev) => ({ ...prev, isReady: true }));
    void refreshMe();
  }

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, refreshMe }),
    [state, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
