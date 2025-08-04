// ts-client/src/components/ProtectedRoutes.tsx

import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "@/app/store";
import type { ReactNode } from "react";

interface RouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: RouteProps): JSX.Element => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export const AuthenticatedUser = ({ children }: RouteProps): JSX.Element => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export const AdminRoute = ({ children }: RouteProps): JSX.Element => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "Instructor") {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};