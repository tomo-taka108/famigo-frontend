/* eslint-disable react-refresh/only-export-components */
// src/auth/AuthContext.tsx

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authStorage } from "./storage";
import {
  fetchMeApi,
  loginApi,
  registerApi,
  type LoginRequest,
  type RegisterRequest,
  type MeResponse,
} from "../api/auth";

type AuthState = {
  isReady: boolean;
  token: string | null;
  user: MeResponse | null;
};

type AuthContextValue = AuthState & {
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ✅ storage.ts の実体に合わせる（getToken）
  const initialToken = authStorage.getToken();

  const [state, setState] = useState<AuthState>({
    isReady: false,
    token: initialToken,
    user: null,
  });

  const logout = useCallback(() => {
    // ✅ storage.ts の実体に合わせる（clearToken）
    authStorage.clearToken();
    setState({ isReady: true, token: null, user: null });
  }, []);

  const refreshMe = useCallback(async () => {
    if (!state.token) return;

    try {
      const me = await fetchMeApi();
      setState((prev) => ({
        ...prev,
        isReady: true,
        user: me,
      }));
    } catch (e: unknown) {
      console.error(e);
      logout();
    }
  }, [state.token, logout]);

  const login = useCallback(async (body: LoginRequest) => {
    const res = await loginApi(body);

    // ✅ storage.ts の実体に合わせる（setToken）
    authStorage.setToken(res.accessToken);

    setState({
      isReady: true,
      token: res.accessToken,
      user: res.user,
    });
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    const res = await registerApi(body);

    // ✅ storage.ts の実体に合わせる（setToken）
    authStorage.setToken(res.accessToken);

    setState({
      isReady: true,
      token: res.accessToken,
      user: res.user,
    });
  }, []);

  // ✅ 初回：tokenがあれば /auth/me でユーザー情報復元
  if (!state.isReady) {
    setState((prev) => ({ ...prev, isReady: true }));
    if (state.token) void refreshMe();
  }

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout, refreshMe }),
    [state, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
