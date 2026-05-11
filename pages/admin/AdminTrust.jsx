import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

export default function AdminTrust() {
  const [stats, setStats] = useState({
    avg_trust: 0,
    high_scorers: 0,
    verified_matches: 0,
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Manual Adjustment State
  const [targetUser, setTargetUser] = useState("");
  const [pointValue, setPointValue] = useState("");
  const [actionMsg, setActionMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    // Safe Fake Data for Global Stats
    setTimeout(() => {
      setStats({ avg_trust: 85, high_scorers: 12, verified_matches: 45 });
      setLoading(false);
    }, 800);
  }, []);

  const handleAdjustScore = async (e) => {
    e.preventDefault(); // 🚨 YEH LINE BOHOT ZAROORI HAI FORM SUBMISSION ROKNE KE LIYE

    setActionMsg({ text: "Updating...", type: "info" });

    try {
      const token = localStorage.getItem("token");

      const payload = { value: parseInt(pointValue) };
      console.log("Sending payload:", payload); // Debugging ke liye

      const res = await axios.post(
        `http://localhost:8000/trust/update/${targetUser}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setActionMsg({
        text: `Success! New score for User ${targetUser}: ${res.data.score}`,
        type: "success",
      });

      // Clear inputs ONLY on success
      setTargetUser("");
      setPointValue("");
    } catch (err) {
      console.error("Trust Update Error:", err);
      // Backend errors ko theek se extract karna
      const errorDetail = err.response?.data?.detail;
      const errorMessage =
        typeof errorDetail === "string"
          ? errorDetail
          : Array.isArray(errorDetail)
            ? errorDetail[0]?.msg
            : "Failed to update score. Check User ID and Points.";

      setActionMsg({
        text: errorMessage,
        type: "error",
      });
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
        <div className="w-10 h-10 border-4 border-[#0B1F4D] border-t-transparent rounded-full animate-spin"></div>
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
          Trust & <span className="text-[#D4AF37]">Integrity</span>
        </h1>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
          Global Campus Honesty Metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-amber-50 text-[#D4AF37] rounded-2xl flex items-center justify-center text-2xl mb-4">
            ⭐
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Avg. Campus Trust
          </p>
          <h3 className="text-3xl font-black text-[#0B1F4D]">
            {stats.avg_trust}%
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4">
            🏆
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Top Contributors
          </p>
          <h3 className="text-3xl font-black text-[#0B1F4D]">
            {stats.high_scorers}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-4">
            ✅
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Verified Returns
          </p>
          <h3 className="text-3xl font-black text-[#0B1F4D]">
            {stats.verified_matches}
          </h3>
        </div>
      </div>

      {/* Manual Trust Score Adjustment Tool */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
          <h2 className="text-xl font-black text-[#0B1F4D] uppercase mb-2">
            Manual Override
          </h2>
          <p className="text-xs text-gray-500 mb-8">
            Administer penalties (negative values) or rewards (positive values)
            to specific users.
          </p>

          <form onSubmit={handleAdjustScore} className="flex flex-col gap-4">
            <input
              type="number"
              placeholder="User ID (e.g., 5)"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              required
              className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#D4AF37]"
            />
            <input
              type="number"
              placeholder="Points (e.g., -10 or 20)"
              value={pointValue}
              onChange={(e) => setPointValue(e.target.value)}
              required
              className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#D4AF37]"
            />
            {/* 🚨 Button ki type submit lazmi honi chahiye taake form ka onSubmit trigger ho */}
            <button
              type="submit"
              className="bg-[#0B1F4D] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase hover:bg-[#D4AF37] hover:text-[#0B1F4D] transition-all"
            >
              Execute Adjustment
            </button>
          </form>

          {actionMsg.text && (
            <div
              className={`mt-4 p-4 rounded-xl text-xs font-bold ${
                actionMsg.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-100"
                  : actionMsg.type === "info"
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : "bg-green-50 text-green-700 border border-green-100"
              }`}
            >
              {actionMsg.text}
            </div>
          )}
        </div>

        {/* System Logic Card */}
        <div className="bg-[#0B1F4D] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              How Trust Works
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <span className="text-[#D4AF37] font-black">01.</span>
                <p className="text-sm text-blue-100">
                  Students gain points by successfully returning items.
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-[#D4AF37] font-black">02.</span>
                <p className="text-sm text-blue-100">
                  Fake reports result in an automatic deduction (-5 points).
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-[#D4AF37] font-black">03.</span>
                <p className="text-sm text-blue-100">
                  High trust scores grant users priority in AI matching.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] text-[15rem] opacity-5 pointer-events-none font-black">
            TRUST
          </div>
        </div>
      </div>
    </div>
  );
}
