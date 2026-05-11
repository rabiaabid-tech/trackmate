//components/navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = (() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const navItem = (path, label) => (
    <Link
      to={path}
      onClick={() => setIsOpen(false)}
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
        location.pathname === path
          ? "bg-[#D4AF37] text-[#0B1F4D]"
          : "text-[#0B1F4D] hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 py-3">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* LEFT SECTION: Logo + Text */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src={logo}
            alt="TrackMate Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-black text-[#0B1F4D] tracking-tighter uppercase">
            TrackMate
          </span>
        </Link>

        {/* CENTER SECTION: Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-100 shadow-sm">
          {/* 🚨 ADMIN FIRST: Admin Console sab se pehle */}
          {user?.is_admin && (
            <Link
              to="/admin/users"
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                location.pathname.startsWith("/admin")
                  ? "bg-[#0B1F4D] text-[#D4AF37]"
                  : "text-[#D4AF37] hover:bg-[#D4AF37]/10"
              }`}
            >
              Admin Console ⚙️
            </Link>
          )}

          {/* 🚨 NORMAL USER FIRST: Home (Admin ko nahi dikhega) */}
          {!user?.is_admin && navItem("/", "Home")}

          {/* COMMON LINKS */}
          {navItem("/lost", "Directory")}
          {navItem("/leaderboard", "Leaderboard")}

          {/* 🚨 HIDDEN FOR ADMIN */}
          {!user?.is_admin && navItem("/guide", "Guide")}
          {user && !user.is_admin && navItem("/lost/my", "My Items")}
          {user && !user.is_admin && navItem("/lost/create", "Report Item")}
          {user && !user.is_admin && navItem("/claims", "Claims")}
        </div>

        {/* RIGHT SECTION: Profile & Logout */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 pr-4 pl-1 py-1 rounded-full shadow-sm">
                <div className="w-6 h-6 bg-[#0B1F4D] text-[#D4AF37] rounded-full flex items-center justify-center text-[9px] font-black tracking-tighter">
                  {getInitials(user.full_name || user.username)}
                </div>
                <span className="text-[9px] font-black uppercase text-[#0B1F4D] tracking-widest">
                  {user.full_name || user.username}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all shadow-sm border border-red-100"
              >
                <svg
                  className="w-3.5 h-3.5 ml-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#0B1F4D] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#081638] transition-all shadow-md"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Hamburger Menu Button (Mobile Only) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[#0B1F4D] focus:outline-none"
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl py-4 px-6 flex flex-col gap-2">
          {/* 🚨 ADMIN FIRST (MOBILE) */}
          {user?.is_admin && navItem("/admin/users", "Admin Console")}

          {/* 🚨 NORMAL USER FIRST (MOBILE) */}
          {!user?.is_admin && navItem("/", "Home")}

          {/* COMMON LINKS */}
          {navItem("/lost", "Directory")}
          {navItem("/leaderboard", "Leaderboard")}

          {/* 🚨 HIDDEN FOR ADMIN (MOBILE) */}
          {!user?.is_admin && navItem("/guide", "Guide")}
          {user && !user.is_admin && navItem("/lost/my", "My Items")}
          {user && !user.is_admin && navItem("/lost/create", "Report Item")}
          {user && !user.is_admin && navItem("/claims", "Claims")}

          <hr className="my-2 border-gray-100" />

          {user ? (
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0B1F4D] text-[#D4AF37] rounded-full flex items-center justify-center text-[10px] font-black">
                  {getInitials(user.full_name || user.username)}
                </div>
                <span className="text-[10px] font-black uppercase text-[#0B1F4D] tracking-widest">
                  {user.full_name || user.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full"
              >
                <svg
                  className="w-4 h-4 ml-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="bg-[#0B1F4D] text-white text-center px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
