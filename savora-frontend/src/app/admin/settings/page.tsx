"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { User, Phone, Mail, Save, Bell, Shield, Key } from "lucide-react";
import { cn } from "@/utils/cn";

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      const userData = res.data.data || res.data;
      setProfile({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || ""
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      await api.put("/users/me", { name: profile.name, phone: profile.phone });
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-secondary flex items-center justify-center min-h-[50vh]">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-primary mb-2">Settings</h1>
        <p className="text-secondary">Manage your admin profile and platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar settings nav (UI Only for now) */}
        <div className="col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-divider text-sm font-medium text-primary text-left transition-colors">
            <User className="w-4 h-4 text-accent" />
            Profile Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-secondary hover:bg-surface/50 hover:text-primary border border-transparent text-left transition-colors opacity-60 cursor-not-allowed">
            <Bell className="w-4 h-4" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-secondary hover:bg-surface/50 hover:text-primary border border-transparent text-left transition-colors opacity-60 cursor-not-allowed">
            <Shield className="w-4 h-4" />
            Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-surface border border-divider rounded-[14px] overflow-hidden">
            <div className="p-6 border-b border-divider">
              <h2 className="text-lg font-medium text-primary mb-1">Personal Information</h2>
              <p className="text-xs text-secondary">Update your admin profile details here.</p>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-secondary/60" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-base border border-divider rounded-lg pl-11 pr-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all"
                    placeholder="Admin Name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-secondary/60" />
                  </div>
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full bg-base border border-divider rounded-lg pl-11 pr-4 py-2.5 text-sm text-secondary outline-none opacity-70 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-secondary mt-1.5 ml-1">Email cannot be changed directly for security reasons.</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-secondary/60" />
                  </div>
                  <input 
                    type="text" 
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-base border border-divider rounded-lg pl-11 pr-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-divider flex items-center justify-between">
                <div>
                  {successMsg && <span className="text-sm font-medium text-emerald-500">{successMsg}</span>}
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-70"
                  style={{ color: "var(--base)" }}
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-base border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="bg-surface border border-divider rounded-[14px] overflow-hidden opacity-70">
            <div className="p-6 border-b border-divider">
              <h2 className="text-lg font-medium text-primary flex items-center gap-2">
                <Key className="w-5 h-5 text-secondary" />
                Authentication
              </h2>
              <p className="text-xs text-secondary mt-1">Manage your password and security keys.</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-secondary mb-4">You are currently authenticated via Supabase secure token exchange.</p>
              <button disabled className="px-4 py-2 bg-base border border-divider rounded-lg text-sm font-medium text-secondary cursor-not-allowed">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
