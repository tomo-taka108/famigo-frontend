// src/components/RequireAuth.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { isReady, user } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <div className="py-10 text-center text-gray-500">読み込み中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
