"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";
import api from "@/lib/axios";
import { cn } from "@/utils/cn";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, modalTitle, login } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = activeTab === "signin" ? "/auth/login" : "/auth/register";
      const payload = activeTab === "signin" 
        ? { email, password } 
        : { email, password, name };
        
      const response = await api.post(endpoint, payload);
      
      // The backend returns { success: true, data: { token, user } }
      const token = response.data.data?.token || response.data.token;

      if (token) {
        login(token);
      } else {
        setError("Invalid response format from server");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `${activeTab === "signin" ? "Login" : "Registration"} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const defaultTitle = activeTab === "signin" ? "Sign in to your account" : "Create your account";
  const displayTitle = modalTitle || defaultTitle;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={closeAuthModal}
      />

      {/* Modal */}
      <div className="relative w-full md:w-full md:max-w-[420px] bg-surface rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-secondary hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-black/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pt-8 px-6 pb-4">
          <h2 className="text-2xl font-serif text-primary mb-6 pr-6 leading-tight">
            {displayTitle}
          </h2>

          {/* Tabs */}
          <div className="flex border-b border-divider gap-6">
            <button
              onClick={() => { setActiveTab("signin"); setError(""); }}
              className={cn(
                "pb-3 text-sm font-medium transition-colors relative cursor-pointer",
                activeTab === "signin" ? "text-primary" : "text-secondary hover:text-primary"
              )}
            >
              Sign In
              {activeTab === "signin" && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#C9622A]" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab("signup"); setError(""); }}
              className={cn(
                "pb-3 text-sm font-medium transition-colors relative cursor-pointer",
                activeTab === "signup" ? "text-primary" : "text-secondary hover:text-primary"
              )}
            >
              Create Account
              {activeTab === "signup" && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#C9622A]" />
              )}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-sm text-error bg-error/10 p-3 rounded-lg border border-error/20">
                {error}
              </div>
            )}

            {activeTab === "signup" && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-divider py-2 text-primary placeholder-secondary/50 focus:ring-0 focus:border-accent focus:border-b-accent transition-colors outline-none text-[15px]"
                  placeholder="Rahul Kumar"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-divider py-2 text-primary placeholder-secondary/50 focus:ring-0 focus:border-accent focus:border-b-accent transition-colors outline-none text-[15px]"
                placeholder="rahul@example.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-divider py-2 text-primary placeholder-secondary/50 focus:ring-0 focus:border-accent focus:border-b-accent transition-colors outline-none text-[15px]"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 rounded-xl text-[15px] font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
                style={{ color: "var(--base)" }}
              >
                {loading ? "Please wait..." : activeTab === "signin" ? "Sign In" : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={closeAuthModal}
              className="text-sm font-medium text-secondary hover:text-primary transition-colors cursor-pointer outline-none"
            >
              Continue browsing as guest
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
