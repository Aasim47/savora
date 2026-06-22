"use client";

import { useState, Suspense } from "react";
import api, { TOKEN_KEY_ADMIN, TOKEN_KEY_CUSTOMER } from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "customer";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      // The backend returns { success: true, data: { token, user } }
      const token = response.data.data?.token || response.data.token;
      const user = response.data.data?.user || response.data.user;

      if (token && user) {
        if (user.role === "ADMIN") {
          localStorage.setItem(TOKEN_KEY_ADMIN, token);
          router.push("/admin");
        } else {
          localStorage.setItem(TOKEN_KEY_CUSTOMER, token);
          router.push("/");
        }
      } else {
        setError("Invalid response format from server");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Gateway
        </Link>
        <h2 className="text-center text-4xl font-serif tracking-tight text-primary">
          {role === "admin" ? "Admin Portal" : "Sign in to Bhojanwale"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-sm sm:rounded-[14px] sm:px-10 border border-divider">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="text-sm text-error bg-error/10 p-3 rounded-lg border border-error/20">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-secondary mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-divider py-2 text-primary placeholder-secondary/50 focus:ring-0 focus:border-accent focus:border-b-accent transition-colors outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-divider py-2 text-primary placeholder-secondary/50 focus:ring-0 focus:border-accent focus:border-b-accent transition-colors outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer transition-colors"
                style={{ color: "var(--base)" }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
            
            {role === "customer" && (
              <div className="pt-6 mt-6 border-t border-divider text-center">
                <p className="text-sm text-secondary mb-4">Don't have an account?</p>
                <Link
                  href="/register"
                  className="w-full flex justify-center py-4 border border-divider rounded-lg shadow-sm text-base font-medium text-primary bg-surface hover:bg-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer transition-colors"
                >
                  Register Now
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-base flex justify-center py-12 text-secondary">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
