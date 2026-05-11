import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Filter State for Flagged Accounts
  const [viewFilter, setViewFilter] = useState("all"); // 'all' or 'flagged'

  const [notification, setNotification] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState({
    lost: [],
    found: [],
    loading: false,
  });

  const showNotification = (type, title, message) => {
    setNotification({ visible: true, type, title, message });
  };

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/users/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      if (err.response?.status === 403) {
        showNotification(
          "error",
          "Access Denied",
          "Not Authorized! Only admins can view this page.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBlock = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !currentStatus;

      await axios.patch(
        `http://localhost:8000/users/admin/users/${userId}/block`,
        { is_blocked: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_blocked: newStatus } : u,
        ),
      );

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, is_blocked: newStatus });
      }

      showNotification(
        "success",
        newStatus ? "User Blocked" : "User Unblocked",
        `The user has been successfully ${newStatus ? "blocked from" : "restored to"} the platform.`,
      );
    } catch (err) {
      console.error("Status Update Error:", err);
      showNotification(
        "error",
        "Action Failed",
        err.response?.data?.detail || "Failed to update user status.",
      );
    }
  };

  const handleViewHistory = async (user) => {
    setSelectedUser(user);
    setUserHistory({ lost: [], found: [], loading: true });

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [lostRes, foundRes] = await Promise.all([
        axios.get("http://localhost:8000/lost/admin/all", config),
        axios.get("http://localhost:8000/found/admin/all", config),
      ]);

      const allLost = Array.isArray(lostRes.data)
        ? lostRes.data
        : lostRes.data?.items || lostRes.data?.data || [];
      const allFound = Array.isArray(foundRes.data)
        ? foundRes.data
        : foundRes.data?.items || foundRes.data?.data || [];

      const userLost = allLost.filter(
        (item) =>
          Number(item.user_id) === Number(user.id) ||
          Number(item.user?.id) === Number(user.id),
      );
      const userFound = allFound.filter(
        (item) =>
          Number(item.user_id) === Number(user.id) ||
          Number(item.user?.id) === Number(user.id),
      );

      setUserHistory({
        lost: userLost,
        found: userFound,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch user history:", err);
      setUserHistory({ lost: [], found: [], loading: false });
      showNotification(
        "error",
        "Data Error",
        "Could not load user's item history.",
      );
    }
  };

  const getTabClass = (path) => {
    return location.pathname === path
      ? "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-[#0B1F4D] text-[#D4AF37] transition-all"
      : "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all";
  };

  // 🚨 FILTER LOGIC: EXCLUDE ADMINS AND APPLY FLAG CHECK
  const filteredUsers = users.filter((u) => {
    if (u.is_admin) return false; // Admins ab list mein nahi aayenge

    if (viewFilter === "all") return true;
    return u.is_flagged || u.trust_score?.score <= -5;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
        <Link to="/admin/users" className={getTabClass("/admin/users")}>
          Users
        </Link>
        <Link to="/admin/claims" className={getTabClass("/admin/claims")}>
          Claims
        </Link>
        <Link to="/admin/trust" className={getTabClass("/admin/trust")}>
          Trust Stats
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0B1F4D] uppercase tracking-tighter">
            User <span className="text-[#D4AF37]">Database</span>
          </h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
            Campus-wide User Oversight
          </p>
        </div>

        {/* FLAGGED ACCOUNTS TOGGLE */}
        <div className="flex gap-2 bg-gray-200/50 p-1.5 rounded-xl w-fit border border-gray-200">
          <button
            onClick={() => setViewFilter("all")}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${
              viewFilter === "all"
                ? "bg-white text-[#0B1F4D] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setViewFilter("flagged")}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${
              viewFilter === "flagged"
                ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                : "text-gray-400 hover:text-red-400"
            }`}
          >
            <span>🚩</span> Flagged
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-[#0B1F4D] text-white">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">
                Student
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">
                Email
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">
                Trust Score
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-16 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
                    {viewFilter === "flagged"
                      ? "No flagged accounts detected."
                      : "No users found."}
                  </p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-gray-50/50 transition-all ${u.is_blocked ? "opacity-60 bg-red-50/30" : ""} ${u.is_flagged && !u.is_blocked ? "bg-orange-50/30" : ""}`}
                >
                  <td className="p-6 font-bold text-[#0B1F4D]">
                    <div className="flex items-center gap-2">
                      {u.is_flagged && !u.is_blocked && (
                        <span
                          className="text-red-500"
                          title="Flagged for suspicious activity"
                        >
                          🚩
                        </span>
                      )}
                      {u.full_name}
                    </div>
                    {u.is_blocked && (
                      <span className="mt-1 inline-block text-[8px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Blocked
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-sm text-gray-500 font-medium">
                    {u.email}
                  </td>
                  <td className="p-6 text-center">
                    <span
                      className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase border ${u.trust_score?.score < 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-[#D4AF37] border-amber-100"}`}
                    >
                      ⭐ {u.trust_score?.score || 0}
                    </span>
                  </td>
                  <td className="p-6 text-right flex justify-end gap-3">
                    <button
                      onClick={() => handleViewHistory(u)}
                      className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
                    >
                      History
                    </button>

                    <button
                      onClick={() => handleToggleBlock(u.id, u.is_blocked)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                        u.is_blocked
                          ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                          : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                      }`}
                    >
                      {u.is_blocked ? "Unblock" : "Block User"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* USER HISTORY MODAL */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1F4D]/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-2xl w-full border border-gray-100 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-[#0B1F4D] uppercase tracking-tighter flex items-center gap-2">
                  {selectedUser.is_flagged && (
                    <span className="text-red-500">🚩</span>
                  )}
                  {selectedUser.full_name}
                </h3>
                <p className="text-sm text-gray-500 font-bold">
                  {selectedUser.email}
                </p>
              </div>

              <button
                onClick={() =>
                  handleToggleBlock(selectedUser.id, selectedUser.is_blocked)
                }
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                  selectedUser.is_blocked
                    ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                    : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                }`}
              >
                {selectedUser.is_blocked ? "UNBLOCK USER" : "BLOCK USER"}
              </button>
            </div>

            {userHistory.loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LOST ITEMS COLUMN */}
                <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-4 border-b border-orange-200 pb-2">
                    Lost Reports ({userHistory.lost.length})
                  </h4>
                  {userHistory.lost.length === 0 ? (
                    <p className="text-xs text-gray-400 font-bold">
                      No lost items reported.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {userHistory.lost.map((item) => (
                        <li
                          key={item.id}
                          className="bg-white p-3 rounded-xl shadow-sm text-sm border border-gray-100"
                        >
                          <span className="font-bold text-[#0B1F4D] block truncate">
                            {item.item_name}
                          </span>
                          <span className="text-[9px] text-gray-400 uppercase tracking-wider">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* FOUND ITEMS COLUMN */}
                <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-4 border-b border-green-200 pb-2">
                    Found Reports ({userHistory.found.length})
                  </h4>
                  {userHistory.found.length === 0 ? (
                    <p className="text-xs text-gray-400 font-bold">
                      No found items reported.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {userHistory.found.map((item) => (
                        <li
                          key={item.id}
                          className="bg-white p-3 rounded-xl shadow-sm text-sm border border-gray-100"
                        >
                          <span className="font-bold text-[#0B1F4D] block truncate">
                            {item.item_name}
                          </span>
                          <span className="text-[9px] text-gray-400 uppercase tracking-wider">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-8 w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              Close Panel
            </button>
          </div>
        </div>
      )}

      {/* PREMIUM CUSTOM NOTIFICATION MODAL */}
      {notification.visible && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1F4D]/80 backdrop-blur-sm p-4"
          onClick={() => setNotification({ ...notification, visible: false })}
        >
          <div
            className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-gray-100 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${notification.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
            >
              {notification.type === "success" ? (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>

            <h3 className="text-2xl font-black text-[#0B1F4D] mb-2 uppercase tracking-tighter">
              {notification.title}
            </h3>
            <p className="text-gray-500 text-sm font-bold mb-8 leading-relaxed">
              {notification.message}
            </p>

            <button
              onClick={() =>
                setNotification({ ...notification, visible: false })
              }
              className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md ${notification.type === "success" ? "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20" : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"}`}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
