"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import api from "@/lib/axios";
import { User, Mail, Phone, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        const userData = res.data.data || res.data;
        setUser({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || ""
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          router.push("/login");
        }
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.put("/users/me", { name: user.name, phone: user.phone });
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base pt-[64px]">
        <Navbar />
        <div className="flex justify-center py-32 text-secondary">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base pt-[64px]">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-12 max-w-3xl">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="font-serif text-4xl text-primary">My Account</h1>
          <p className="text-secondary mt-2">Manage your personal information.</p>
        </div>

        <div className="bg-surface border border-divider rounded-[14px] p-6 md:p-10 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-widest text-[10px]">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-secondary/50" />
                </div>
                <input
                  type="text"
                  required
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full bg-base border border-divider rounded-lg pl-12 pr-4 py-3 text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-widest text-[10px]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-secondary/50" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-base/50 border border-divider rounded-lg pl-12 pr-4 py-3 text-secondary outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-secondary mt-1 ml-1">Email address cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-widest text-[10px]">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-secondary/50" />
                </div>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  className="w-full bg-base border border-divider rounded-lg pl-12 pr-4 py-3 text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-divider/50 flex items-center justify-between">
              <span className="text-sm font-medium text-accent">{message}</span>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                style={{ color: "var(--base)" }}
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
