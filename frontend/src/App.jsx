// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// --- AUTH ---
import Login from "./pages/auth/Login";

// --- DASHBOARD & PUBLIC ---
import Dashboard from "./pages/dashboard/Dashboard";
import UserGuide from "./pages/guide/UserGuide";
import Leaderboard from "./pages/trust/Leaderboard";

// --- UNIFIED INVENTORY MODULE ---
import LostList from "./pages/lost/LostList";
import CreateLost from "./pages/lost/CreateLost";
import EditLost from "./pages/lost/EditLost";
import MyItems from "./pages/lost/MyItems";
import LostDetail from "./pages/lost/LostDetail";

// --- CLAIMS MODULE ---
import MyClaims from "./pages/claims/MyClaims";

// --- ADMIN PAGES ---
import AdminUsers from "./pages/admin/AdminUsers";
import AdminClaims from "./pages/admin/AdminClaims";
import AdminTrust from "./pages/admin/AdminTrust";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🚨 STANDALONE LOGIN PAGE (No Navbar) */}
        <Route path="/login" element={<Login />} />

        {/* 🚨 MAIN LAYOUT (Navbar included for all routes inside this) */}
        <Route element={<MainLayout />}>
          {/* 🟢 PUBLIC ROUTES (Bina login ke sab ko nazar aayengi) */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guide" element={<UserGuide />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/lost" element={<LostList />} />
          <Route path="/found" element={<LostList />} />
          <Route path="/lost/:id" element={<LostDetail />} />
          <Route path="/found/:id" element={<LostDetail />} />

          {/* 🔴 SECURE ROUTES (Sirf Logged-In users ke liye) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/lost/create" element={<CreateLost />} />
            <Route path="/lost/my" element={<MyItems />} />
            <Route path="/found/my" element={<MyItems />} />
            <Route path="/lost/edit/:id" element={<EditLost />} />
            <Route path="/found/edit/:id" element={<EditLost />} />
            <Route path="/claims" element={<MyClaims />} />
          </Route>

          {/* ⚙️ ADMIN ROUTES */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/claims" element={<AdminClaims />} />
            <Route path="/admin/trust" element={<AdminTrust />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
