import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [otpInputs, setOtpInputs] = useState({});

  // NEW: Custom Notification State (No more boring alerts)
  const [notification, setNotification] = useState({
    visible: false,
    type: "success", // 'success' or 'error'
    title: "",
    message: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const showNotification = (type, title, message) => {
    setNotification({ visible: true, type, title, message });
  };

  const closeNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/claims/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(res.data || []);
    } catch (err) {
      console.error("Error fetching claims:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Handle Approving a Claim
  const handleApprove = async (claimId) => {
    setActionLoading(claimId);
    try {
      await axios.put(
        `http://localhost:8000/claims/${claimId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showNotification(
        "success",
        "Claim Approved!",
        "Emails have been sent to both parties with further instructions.",
      );
      fetchClaims();
    } catch (err) {
      showNotification(
        "error",
        "Approval Failed",
        err.response?.data?.detail ||
          "Failed to approve the claim. Please try again.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // 🚨 NEW: Handle Rejecting a Claim
  const handleReject = async (claimId) => {
    setActionLoading(claimId);
    try {
      await axios.put(
        `http://localhost:8000/claims/${claimId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showNotification(
        "success",
        "Claim Rejected",
        "The claim has been declined. Trust score penalties may apply to the claimant.",
      );
      fetchClaims();
    } catch (err) {
      showNotification(
        "error",
        "Rejection Failed",
        err.response?.data?.detail ||
          "Failed to reject the claim. Please try again.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleOtpChange = (claimId, value) => {
    setOtpInputs((prev) => ({ ...prev, [claimId]: value }));
  };

  // Handle OTP Verification
  const handleVerifyOTP = async (claimId) => {
    const code = otpInputs[claimId]?.trim();
    if (!code || code.length < 6) {
      showNotification(
        "error",
        "Invalid Input",
        "Please enter a valid 6-character OTP code.",
      );
      return;
    }

    setActionLoading(claimId);
    try {
      await axios.post(
        `http://localhost:8000/claims/${claimId}/verify`,
        { code: code },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showNotification(
        "success",
        "Handover Verified!",
        "Congratulations! Trust scores have been updated successfully.",
      );
      fetchClaims();
    } catch (err) {
      showNotification(
        "error",
        "Verification Failed",
        err.response?.data?.detail ||
          "Incorrect OTP. Please check and try again.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // SMART PROOF EXTRACTOR: Har possible backend variable name cover kar liya hai
  const getProofText = (claim) => {
    const directProof =
      claim.proof_description ||
      claim.proof ||
      claim.justification ||
      claim.message;

    if (
      directProof &&
      typeof directProof === "string" &&
      directProof.trim() !== ""
    ) {
      return directProof;
    }

    if (claim.ownership_answers) {
      try {
        const parsed = JSON.parse(claim.ownership_answers);
        return (
          parsed.proof_description ||
          parsed.text_proof ||
          parsed.justification ||
          claim.ownership_answers
        );
      } catch {
        return claim.ownership_answers;
      }
    }
    return "No proof provided.";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  const receivedClaims = claims.filter((c) => c.finder_id === user?.id);
  const submittedClaims = claims.filter((c) => c.claimant_id === user?.id);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending_approval":
        return (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Pending
          </span>
        );
      case "awaiting_verification":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Awaiting OTP
          </span>
        );
      case "verified":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Returned & Verified
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB] pb-20 pt-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-[#0B1F4D] uppercase tracking-tighter">
              Dispute <span className="text-[#D4AF37]">Resolution</span>
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              Manage your active claims and verify ownership securely.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* LEFT COLUMN: Claims Received */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📥</span>
                <h2 className="text-xl font-black text-[#0B1F4D] uppercase tracking-widest">
                  Claims Received
                </h2>
              </div>

              {receivedClaims.length === 0 ? (
                <div className="bg-white p-10 rounded-[2rem] border border-gray-100 text-center shadow-sm">
                  <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
                    No incoming claims
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className={`bg-white p-6 rounded-[2rem] border ${claim.status === "awaiting_verification" ? "border-blue-200 shadow-blue-100" : "border-gray-100"} shadow-xl flex flex-col gap-4`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">
                            Claim Ref: TM-{claim.id}
                          </p>
                          {getStatusBadge(claim.status)}
                        </div>
                        <span className="text-gray-400 text-[10px] font-bold uppercase">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Claimant's Proof
                        </p>
                        <p className="text-sm font-medium text-[#0B1F4D] italic">
                          "{getProofText(claim)}"
                        </p>
                      </div>

                      {/* 🚨 UPDATED: Approve and Reject Buttons wrapped together */}
                      {claim.status === "pending_approval" && (
                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() => handleReject(claim.id)}
                            disabled={actionLoading === claim.id}
                            className="flex-1 bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                          >
                            {actionLoading === claim.id ? "..." : "Reject"}
                          </button>
                          <button
                            onClick={() => handleApprove(claim.id)}
                            disabled={actionLoading === claim.id}
                            className="flex-1 bg-[#0B1F4D] text-[#D4AF37] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#D4AF37] hover:text-[#0B1F4D] transition-all disabled:opacity-50"
                          >
                            {actionLoading === claim.id
                              ? "Processing..."
                              : "Approve"}
                          </button>
                        </div>
                      )}

                      {claim.status === "awaiting_verification" && (
                        <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
                          <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3">
                            Meeting Handover Verification
                          </p>
                          <p className="text-xs text-blue-600 mb-4 font-medium">
                            Ask the claimant for the 6-digit OTP they received
                            in their email and enter it below to complete the
                            handover.
                          </p>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. A1B2C3"
                              maxLength={6}
                              value={otpInputs[claim.id] || ""}
                              onChange={(e) =>
                                handleOtpChange(
                                  claim.id,
                                  e.target.value.toUpperCase(),
                                )
                              }
                              className="flex-1 px-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:border-blue-500 font-mono text-center tracking-[0.5em] font-bold text-gray-700 uppercase bg-white"
                            />
                            <button
                              onClick={() => handleVerifyOTP(claim.id)}
                              disabled={
                                actionLoading === claim.id ||
                                (otpInputs[claim.id]?.length || 0) < 6
                              }
                              className="bg-blue-600 text-white px-6 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === claim.id ? "..." : "Verify"}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 pt-4 border-t border-gray-50 flex justify-end">
                        <Link
                          to={`/${claim.found_item_id ? "found" : "lost"}/${claim.found_item_id || claim.lost_item_id}`}
                          className="text-[10px] font-black uppercase tracking-widest text-[#0B1F4D] hover:text-[#D4AF37] transition-all"
                        >
                          View Item Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Claims Submitted */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📤</span>
                <h2 className="text-xl font-black text-[#0B1F4D] uppercase tracking-widest">
                  Claims Submitted
                </h2>
              </div>

              {submittedClaims.length === 0 ? (
                <div className="bg-white p-10 rounded-[2rem] border border-gray-100 text-center shadow-sm">
                  <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
                    No claims submitted
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submittedClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4 opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Claim Ref: TM-{claim.id}
                          </p>
                          {getStatusBadge(claim.status)}
                        </div>
                        <span className="text-gray-400 text-[10px] font-bold uppercase">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          My Proof
                        </p>
                        <p className="text-sm font-medium text-gray-600">
                          "{getProofText(claim)}"
                        </p>
                      </div>

                      {claim.status === "awaiting_verification" && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
                          <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">
                            Action Required
                          </p>
                          <p className="text-xs text-amber-700 font-medium">
                            Your claim is approved! Check your email for the OTP
                            and contact details of the finder to arrange a
                            meeting.
                          </p>
                        </div>
                      )}

                      <div className="mt-2 pt-4 border-t border-gray-50 flex justify-end">
                        <Link
                          to={`/${claim.found_item_id ? "found" : "lost"}/${claim.found_item_id || claim.lost_item_id}`}
                          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#D4AF37] transition-all"
                        >
                          View Item Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM CUSTOM NOTIFICATION MODAL */}
      {notification.visible && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1F4D]/80 backdrop-blur-sm p-4"
          onClick={closeNotification}
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
              onClick={closeNotification}
              className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md ${notification.type === "success" ? "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20" : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"}`}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
}
