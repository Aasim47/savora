"use client";

import { useState } from "react";
import api, { TOKEN_KEY_CUSTOMER } from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        name
      });

      // The backend returns { success: true, data: { token, user } }
      const token = response.data.data?.token || response.data.token;
      
      if (token) {
        localStorage.setItem(TOKEN_KEY_CUSTOMER, token);
        router.push("/");
      } else {
        setError("Invalid response format from server");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h2 className="text-center text-4xl font-serif tracking-tight text-primary">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-divider">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="text-sm text-error bg-error/10 p-3 rounded-lg border border-error/20">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-secondary mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-divider py-2 text-primary placeholder-secondary/50 focus:ring-0 focus:border-accent focus:border-b-accent transition-colors outline-none"
              />
            </div>

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
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
