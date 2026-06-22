"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Search, Filter, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="p-8 text-secondary flex items-center justify-center min-h-[50vh]">Loading users...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-primary mb-2">Users</h1>
        <p className="text-secondary">View registered users and roles.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary/60" />
          </div>
          <input
            type="text"
            placeholder="Search by Name or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-divider rounded-lg pl-10 pr-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all"
          />
        </div>
        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-secondary/60" />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-surface border border-divider rounded-lg pl-10 pr-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all cursor-pointer appearance-none"
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-secondary/60" />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-[14px] border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-base/50">
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Joined Date</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Name</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Email</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Role</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filteredUsers = users.filter(user => {
                  const searchStr = searchQuery.toLowerCase();
                  const matchesSearch = 
                    (user.name || "").toLowerCase().includes(searchStr) ||
                    (user.email || "").toLowerCase().includes(searchStr);
                    
                  const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
                  
                  return matchesSearch && matchesRole;
                });

                if (filteredUsers.length === 0) {
                  return <tr><td colSpan={4} className="py-8 text-center text-secondary">No users match your filters.</td></tr>;
                }

                return filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-divider/60 hover:bg-base/30 transition-colors cursor-pointer" onClick={() => router.push(`/admin/users/${user.id}`)}>
                    <td className="py-4 px-6 text-sm text-secondary whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-4 px-6 text-sm text-primary font-medium">{user.name}</td>
                    <td className="py-4 px-6 text-sm text-secondary">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full ${user.role === 'ADMIN' ? 'bg-[#DBEAFE]/50 text-[#1E40AF]' : 'bg-surface border border-divider text-secondary'}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
