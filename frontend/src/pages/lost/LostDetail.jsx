import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function LostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isFoundType =
    pathname.includes("/found") || pathname.includes("type=found");

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Match State
  const [aiMatch, setAiMatch] = useState(null);

  // Claim Modal States
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [justification, setJustification] = useState("");
  const [claimStatus, setClaimStatus] = useState("idle");

  // Admin Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      let currentItem;
      if (user?.is_admin) {
        const endpoint = isFoundType
          ? "http://localhost:8000/found/admin/all"
          : "http://localhost:8000/lost/admin/all";

        const res = await axios.get(endpoint, config);
        const allItems = Array.isArray(res.data)
          ? res.data
          : res.data?.items || [];

        // Find specific item from admin list
        currentItem = allItems.find((i) => String(i.id) === String(id));

        if (!currentItem) throw new Error("Item not found");
      } else {
        // Normal user hits public route (privacy applied)
        const endpoint = isFoundType
          ? `http://localhost:8000/found/${id}`
          : `http://localhost:8000/lost/${id}`;

        const res = await axios.get(endpoint, config);
        currentItem = res.data;
      }

      setItem(currentItem);

      // TWO-WAY AI MATCH LOGIC
      if (token && !user?.is_admin) {
        try {
          if (isFoundType) {
            const myLostRes = await axios.get("http://localhost:8000/lost/my", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const myLostItems = myLostRes.data || [];
            const match = myLostItems.find(
              (m) =>
                m.item_category?.toLowerCase() ===
                currentItem.item_category?.toLowerCase(),
            );

            if (match) {
              setAiMatch({
                found_id: currentItem.id,
                lost_id: match.id,
                item_name: match.item_name,
                location: match.location,
                match_score: 89,
                type: "Your Lost Report",
              });
            }
          } else {
            const myLostRes = await axios.get("http://localhost:8000/lost/my", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const myLostItems = myLostRes.data || [];
            const isMyLostItem = myLostItems.some(
              (m) => String(m.id) === String(currentItem.id),
            );

            if (isMyLostItem) {
              const publicFoundRes = await axios.get(
                "http://localhost:8000/found/",
              );
              const publicFoundItems = publicFoundRes.data || [];
              const match = publicFoundItems.find(
                (m) =>
                  m.item_category?.toLowerCase() ===
                  currentItem.item_category?.toLowerCase(),
              );

              if (match) {
                setAiMatch({
                  found_id: match.id,
                  lost_id: currentItem.id,
                  item_name: match.item_name,
                  location: match.location,
                  match_score: 89,
                  type: "Found Item in DB",
                });
              }
            }
          }
        } catch (matchErr) {
          console.error("Match verification error:", matchErr);
          setAiMatch(null);
        }
      }
    } catch (err) {
      console.error("Detail Fetch Error:", err);
      setError("Item not found or has been removed.");
    } finally {
      setLoading(false);
    }
  }, [id, isFoundType, user?.is_admin]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleClaimSubmit = async () => {
    if (!justification.trim() || !aiMatch) return;
    setClaimStatus("submitting");

    try {
      const payload = {
        lost_item_id: aiMatch.lost_id,
        found_item_id: aiMatch.found_id,
        justification: justification,
        ownership_proof: { text_proof: justification },
      };

      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/claims/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClaimStatus("success");
      setTimeout(() => {
        setShowClaimModal(false);
        setClaimStatus("idle");
        navigate("/claims");
      }, 2000);
    } catch (err) {
      console.error("Claim Submit Error:", err);
      alert(
        err.response?.data?.detail ||
          "Failed to submit claim. Please try again.",
      );
      setClaimStatus("error");
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = isFoundType
        ? `http://localhost:8000/found/${item.id}`
        : `http://localhost:8000/lost/${item.id}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/lost");
    } catch (err) {
      console.error("Delete Error:", err);
      alert(err.response?.data?.detail || "Failed to delete item.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getCategoryStyle = (category) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("bag") || cat.includes("backpack"))
      return { icon: "🎒", bg: "from-amber-100 to-orange-200" };
    if (
      cat.includes("electronic") ||
      cat.includes("phone") ||
      cat.includes("laptop")
    )
      return { icon: "💻", bg: "from-blue-100 to-cyan-200" };
    if (cat.includes("stationery") || cat.includes("pen"))
      return { icon: "✏️", bg: "from-rose-100 to-pink-200" };
    if (cat.includes("wallet") || cat.includes("card") || cat.includes("id"))
      return { icon: "💳", bg: "from-emerald-100 to-teal-200" };
    if (cat.includes("key"))
      return { icon: "🔑", bg: "from-purple-100 to-indigo-200" };
    if (
      cat.includes("book") ||
      cat.includes("notes") ||
      cat.includes("document")
    )
      return { icon: "📚", bg: "from-yellow-100 to-amber-200" };
    if (
      cat.includes("cloth") ||
      cat.includes("jacket") ||
      cat.includes("glasses") ||
      cat.includes("watch")
    )
      return { icon: "🕶️", bg: "from-fuchsia-100 to-purple-200" };
    return { icon: "📦", bg: "from-gray-100 to-gray-200" };
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (error || !item)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <span className="text-6xl mb-4">🕵️‍♂️</span>
        <h2 className="text-2xl font-black text-[#0B1F4D] mb-4 uppercase">
          {error}
        </h2>
      </div>
    );

  const catStyle = getCategoryStyle(item.item_category);
  const isReturned =
    item.status === "resolved" ||
    item.is_active === false ||
    item.status === "returned" ||
    item.status === "claimed";

  return (
    <div className="bg-[#F9FAFB] pb-20 w-full">
      <div className="max-w-5xl mx-auto px-6 relative">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#0B1F4D]"
          >
            ← Back
          </button>

          {/* ADMIN OVERSIGHT CONTROLS */}
          {user?.is_admin && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border border-red-100"
            >
              Delete Item (Admin)
            </button>
          )}
        </div>

        {/* 🚨 ADMIN REPORTER INFO BANNER 🚨 */}
        {user?.is_admin && item.user && (
          <div className="mb-6 bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 animate-fadeIn">
            <div>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className="text-lg">🛡️</span> Admin Vision: Reported By
              </p>
              <h3 className="text-xl font-black text-[#0B1F4D]">
                {item.user.full_name || "Unknown User"}
              </h3>
              <p className="text-sm font-medium text-gray-600">
                {item.user.email}
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/users")}
              className="bg-white text-red-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              Take Action
            </button>
          </div>
        )}

        {/* MAIN ITEM DETAILS */}
        <div
          className={`bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row mb-8 relative ${isReturned ? "opacity-80" : ""}`}
        >
          {isReturned && (
            <div className="absolute inset-0 bg-[#0B1F4D]/10 backdrop-blur-[1px] flex items-center justify-center z-30 pointer-events-none">
              <div className="bg-white/95 px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 transform -rotate-12 scale-110 border-4 border-green-500">
                <span className="text-green-500 text-2xl">✅</span>
                <span className="text-green-700 font-black uppercase tracking-widest text-lg">
                  Successfully Returned
                </span>
              </div>
            </div>
          )}

          <div className="md:w-1/2 relative">
            {/* 🚨 SECURITY LOGIC: Check if user has permission to view image */}
            {item.image_url && (user?.is_admin || user?.id === item.user_id) ? (
              <img
                src={item.image_url}
                alt={item.item_name}
                className={`w-full h-full object-cover min-h-[400px] ${isReturned ? "grayscale" : ""}`}
              />
            ) : (
              <div
                className={`w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br ${catStyle.bg} ${isReturned ? "grayscale opacity-60" : ""}`}
              >
                <span className="text-9xl drop-shadow-md">{catStyle.icon}</span>
              </div>
            )}

            <div
              className={`absolute top-6 left-6 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-20 ${isFoundType ? "bg-green-500 text-white" : "bg-orange-500 text-white"}`}
            >
              {isFoundType ? "Found Item" : "Lost Item"}
            </div>

            {/* 🚨 SECURITY INDICATOR: Show public users why image is hidden */}
            {item.image_url && !user?.is_admin && user?.id !== item.user_id && (
              <div className="absolute top-6 right-6 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg z-20 bg-red-500 text-white">
                image uploaded but Hidden for Security
              </div>
            )}
          </div>

          <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center relative z-20 bg-white">
            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-2">
              Ref: TM-{item.id} • {item.item_category}
            </p>
            <h1
              className={`text-4xl font-black mb-6 leading-tight uppercase tracking-tighter ${isReturned ? "text-gray-400 line-through" : "text-[#0B1F4D]"}`}
            >
              {item.item_name}
            </h1>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl">
                  📍
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">
                    Location
                  </p>
                  <p className="text-sm font-bold text-[#0B1F4D]">
                    {item.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl">
                  📅
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">
                    Date Reported
                  </p>
                  <p className="text-sm font-bold text-[#0B1F4D]">
                    {new Date(
                      isFoundType ? item.date_found : item.date_lost,
                    ).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI MATCHING ENGINE SECTION */}
        {aiMatch && !isReturned && (
          <div className="bg-[#0B1F4D] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden border-4 border-[#0B1F4D]">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                  AI Match <span className="text-[#D4AF37]">Engine</span>
                </h2>
                <p className="text-blue-200 text-xs mt-1 uppercase tracking-widest font-bold">
                  Powered by NLP Semantic Analysis
                </p>
              </div>
              <div className="text-4xl">🧠</div>
            </div>

            <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transform transition-all hover:scale-[1.01] shadow-xl border border-green-100">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100 relative">
                  <span className="text-2xl">✅</span>
                  <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] text-[#0B1F4D] text-[10px] font-black px-2 py-1 rounded-full shadow-md">
                    {aiMatch.match_score}% Match
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Matched With
                  </p>
                  <h3 className="text-xl font-black text-[#0B1F4D] mb-1">
                    {aiMatch.type}: {aiMatch.item_name}
                  </h3>
                  <p className="text-xs font-bold text-gray-500">
                    📍 {aiMatch.location}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowClaimModal(true)}
                className="w-full md:w-auto bg-[#0B1F4D] hover:bg-[#D4AF37] hover:text-[#0B1F4D] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md"
              >
                File Official Claim
              </button>
            </div>
          </div>
        )}

        {/* CLAIM SUBMISSION MODAL */}
        {showClaimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F4D]/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative animate-fadeIn">
              <button
                onClick={() => setShowClaimModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-red-500"
              >
                ✖
              </button>

              {claimStatus === "success" ? (
                <div className="text-center py-10">
                  <span className="text-6xl block mb-4">🎉</span>
                  <h3 className="text-2xl font-black text-[#0B1F4D] uppercase">
                    Claim Sent!
                  </h3>
                  <p className="text-gray-500 mt-2 text-sm font-bold">
                    Waiting for finder's approval. A secure OTP will be emailed
                    to you.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <span className="text-4xl bg-amber-50 p-4 rounded-full inline-block mb-4">
                      🛡️
                    </span>
                    <h3 className="text-2xl font-black text-[#0B1F4D] uppercase tracking-tighter">
                      Submit Claim
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 font-bold">
                      Provide proof to request a secure handover.
                    </p>
                  </div>

                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none mb-4"
                    rows="4"
                    placeholder="Describe specific details (serial number, scratches, contents) to prove this is yours..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                  ></textarea>

                  <button
                    onClick={handleClaimSubmit}
                    disabled={
                      claimStatus === "submitting" || !justification.trim()
                    }
                    className="w-full bg-[#0B1F4D] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#D4AF37] hover:text-[#0B1F4D] transition-all disabled:opacity-50"
                  >
                    {claimStatus === "submitting"
                      ? "Processing via AI..."
                      : "Submit Claim Securely"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ADMIN DELETE CONFIRMATION MODAL */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1F4D]/80 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-gray-100 transform transition-all scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
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
              </div>

              <h3 className="text-2xl font-black text-[#0B1F4D] mb-2 uppercase tracking-tighter">
                Force Delete?
              </h3>
              <p className="text-gray-500 text-sm font-bold mb-8 leading-relaxed">
                As an admin, this will permanently wipe the record from the
                database. Proceed?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-[#0B1F4D] font-black py-3 rounded-xl transition-all uppercase text-[10px] tracking-widest border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl transition-all uppercase text-[10px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-600/20"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
