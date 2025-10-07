import AdminDashboard from "@/components/dashboard/AdminDashboard";
import UserDashboard from "@/components/dashboard/UserDashboard";

//role ini akan datang dari data sesi login.
// const userRole = "admin";
const userRole = 'admin'; 

export default function DashboardPage() {
  return (
    <div>
      {userRole === "admin" ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
}

