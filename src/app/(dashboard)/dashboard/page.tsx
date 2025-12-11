'use client'

import AdminDashboard from "@/components/dashboard/AdminDashboard";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading user data...</div>;
  }

  // Show dashboard based on role:
  // - owner: Company owner (created company) - sees admin dashboard
  // - manager: Can manage employees - sees admin dashboard  
  // - employee: Regular employee (joined company) - sees user dashboard
  const isAdminRole = user.role === 'owner' || user.role === 'manager';
  
  return isAdminRole ? <AdminDashboard /> : <UserDashboard />;
}

