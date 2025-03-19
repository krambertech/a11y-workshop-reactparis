import { createContext, ReactNode, useContext } from "react";
import { User } from "../../api";
import { useCurrentUser } from "./queries";

export type AuthData = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthData | null>(null);

export type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const hasToken = localStorage.getItem("token") !== null;
  const { data: user, isLoading, error } = useCurrentUser();

  // Combine the auth data
  const authData: AuthData = {
    user: user || null,
    isAuthenticated: hasToken && !error,
    isLoading,
  };

  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
