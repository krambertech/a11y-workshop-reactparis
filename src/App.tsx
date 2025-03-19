import { ReactNode } from "react";
import { Routes, Route } from "react-router";
import { ShieldQuestion } from "lucide-react";

import { Register } from "./pages/Register";
import { MainNav } from "./components/MainNav";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { EmptyState } from "./components/ui/EmptyState";

import { User } from "./pages/User";
import { Toaster, ToastProvider } from "./components/ui/Toast";
import { Users } from "./pages/Users";
import { useAuth } from "./helpers/auth";
import { LoadingState } from "./components/ui/LoadingState";

import "./App.css";

function App() {
  return (
    <ToastProvider>
      <MainNav />

      <main id="main-content">
        <Routes>
          <Route
            index
            path="/home/:category?"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/:id"
            element={
              <ProtectedRoute>
                <User />
              </ProtectedRoute>
            }
          />

          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="*"
            element={
              <EmptyState variant="info" icon={ShieldQuestion} role="alert">
                Page not found
              </EmptyState>
            }
          />
        </Routes>
      </main>
      <Toaster />
    </ToastProvider>
  );
}

/**
 * Simple utility component to protect routes that require authentication
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return (
      <>
        <EmptyState variant="info" icon={ShieldQuestion} role="alert">
          Please log in or register to view this page
        </EmptyState>
      </>
    );
  }

  return <>{children}</>;
}

export default App;
