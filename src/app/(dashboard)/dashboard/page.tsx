'use client'

import AdminDashboard from "@/components/dashboard/AdminDashboard";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth(); // Ambil data user dari context

  // Tampilkan loading atau fallback jika user belum ada
  if (!user) {
    return <div>Loading user data...</div>;
  }

  // Tampilkan dashboard berdasarkan peran (role) dari user yang sedang login
  return user.role === 'admin' || user.role === 'superadmin' ? <AdminDashboard /> : <UserDashboard />;
}

