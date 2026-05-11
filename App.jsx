// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// --- AUTH ---
import Login from "./pages/auth/Login";

// --- DASHBOARD ---
import Dashboard from "./pages/dashboard/Dashboard";

import UserGuide from "./pages/guide/UserGuide";

// --- LOST & FOUND (Using 'lost' folder as primary) ---
import LostList from "./pages/lost/LostList";
import CreateLost from "./pages/lost/CreateLost";
import EditLost from "./pages/lost/EditLost";
import MyLost from "./pages/lost/MyItems";
import LostDetail from "./pages/lost/LostDetail";

// --- 🚨 CLAIMS MODULE (Naya Add Kiya Hai) 🚨 ---
import MyClaims from "./pages/claims/MyClaims";

// --- ADMIN PAGES ---
import AdminUsers from "./pages/admin/AdminUsers";
import AdminClaims from "./pages/admin/AdminClaims";
import AdminTrust from "./pages/admin/AdminTrust";

// --- OTHER ---
import Leaderboard from "./pages/trust/Leaderboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/lost" element={<LostList />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/guide" element={<UserGuide />} />

          {/* Smart Details: Handles both /lost/:id and /found/:id */}
          <Route path="/lost/:id" element={<LostDetail />} />
          <Route path="/found/:id" element={<LostDetail />} />

          {/* --- STUDENT PROTECTED ROUTES --- */}
          <Route
            path="/lost/my"
            element={
              <ProtectedRoute>
                <MyLost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lost/create"
            element={
              <ProtectedRoute>
                <CreateLost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lost/edit/:id"
            element={
              <ProtectedRoute>
                <EditLost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/found/edit/:id"
            element={
              <ProtectedRoute>
                <EditLost />
              </ProtectedRoute>
            }
          />

          {/* 🚨 NAYA DARWAZA: Claims Route 🚨 */}
          <Route
            path="/claims"
            element={
              <ProtectedRoute>
                <MyClaims />
              </ProtectedRoute>
            }
          />

          {/* --- 🚨 ADMIN ONLY ROUTES 🚨 --- */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/claims"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminClaims />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trust"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminTrust />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all: Redirect unknown URLs to Dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
