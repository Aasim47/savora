"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TOKEN_KEY_CUSTOMER } from "@/lib/axios";

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  modalTitle?: string;
  pendingAction: (() => void) | null;
  openAuthModal: (action?: () => void, title?: string) => void;
  closeAuthModal: () => void;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string | undefined>();
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Check initial auth state
    const token = localStorage.getItem(TOKEN_KEY_CUSTOMER);
    if (token) {
      setIsAuthenticated(true);
    }

    // Listen for auth-error events from axios interceptor
    const handleAuthError = () => {
      setIsAuthenticated(false);
      openAuthModal(undefined, "Your session has expired. Please sign in again.");
    };

    window.addEventListener("auth-error", handleAuthError);
    return () => window.removeEventListener("auth-error", handleAuthError);
  }, []);

  const openAuthModal = (action?: () => void, title?: string) => {
    if (action) setPendingAction(() => action);
    if (title) setModalTitle(title);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setTimeout(() => {
      setPendingAction(null);
      setModalTitle(undefined);
    }, 300); // Wait for transition to finish before clearing
  };

  const login = (token: string) => {
    localStorage.setItem(TOKEN_KEY_CUSTOMER, token);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    
    // Execute pending action if any exists
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY_CUSTOMER);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthModalOpen,
        modalTitle,
        pendingAction,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
