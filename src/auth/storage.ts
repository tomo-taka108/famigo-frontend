// src/auth/storage.ts
const TOKEN_KEY = "famigo_access_token";

// ✅ client.ts が `import { getToken } ...` しているので必須
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const authStorage = {
  getToken(): string | null {
    return getToken();
  },
  setToken(token: string) {
    setToken(token);
  },
  clearToken() {
    clearToken();
  },
};
