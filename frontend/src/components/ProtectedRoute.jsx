import { Navigate, Outlet } from "react-router-dom"; // 🚨 Outlet add karna lazmi hai

export default function ProtectedRoute({ adminOnly = false }) {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    user = null;
  }

  // 1. Agar token nahi hai, login pe bhejo
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Agar adminOnly hai par user admin nahi hai, home pe bhejo
  if (adminOnly && !user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  // 3. 🚨 Sab theek hai toh Outlet render karo
  return <Outlet />;
}
