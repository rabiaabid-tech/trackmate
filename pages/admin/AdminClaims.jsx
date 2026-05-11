import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchClaims = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      // 🚨 Ensure you have a GET route for admin claims in backend
      const res = await axios.get("http://localhost:8000/claims", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter out only pending claims for admin to resolve
      const pendingClaims = res.data.filter(
        (c) => c.status === "pending" || c.status === "disputed",
      );
      setClaims(pendingClaims || []);
    } catch (err) {
      console.error("Fetch Claims Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleUpdateStatus = async (claimId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      // API expects status as a query parameter based on your backend code
      await axios.put(
        `http://localhost:8000/claims/${claimId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Remove the resolved claim from the UI
      setClaims(claims.filter((c) => c.id !== claimId));
      alert(`Claim successfully marked as ${newStatus}`);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update claim.");
    }
  };

  const getTabClass = (path) => {
    return location.pathname === path
      ? "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-[#0B1F4D] text-[#D4AF37] transition-all"
      : "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* ADMIN NAVIGATION TABS */}
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

      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#0B1F4D] uppercase tracking-tighter">
          Verification <span className="text-[#D4AF37]">Desk</span>
        </h1>
      </div>

      {claims.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl border border-dashed border-gray-200">
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-xl font-black text-[#0B1F4D] uppercase">
            No Pending Disputes
          </h2>
          <p className="text-gray-400 mt-2 text-sm max-w-md mx-auto">
            Currently, all reported items are being handled directly by
            students. Admin intervention is only required for disputed claims.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white p-8 rounded-[2rem] shadow-md border border-gray-100 flex items-center justify-between"
            >
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Claim #{claim.id}
                </p>
                <h3 className="text-xl font-bold text-[#0B1F4D]">
                  Dispute Review Required
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Claimant ID: {claim.claimant_id} | Finder ID:{" "}
                  {claim.finder_id}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateStatus(claim.id, "approved")}
                  className="bg-green-100 text-green-700 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-200 transition-all"
                >
                  Force Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus(claim.id, "rejected")}
                  className="bg-red-100 text-red-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-200 transition-all"
                >
                  Reject & Penalize
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
