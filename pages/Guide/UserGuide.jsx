import React from "react";

// Icons updated to accept color props
const ReportIcon = ({ color }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <rect x="7" y="7" width="8" height="8" rx="1"></rect>
  </svg>
);

const FoundIcon = ({ color }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const AIIcon = ({ color }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
  </svg>
);

const ClaimIcon = ({ color }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <polyline points="9 12 11 14 15 10"></polyline>
  </svg>
);

const TrustIcon = ({ color }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
);

export default function UserGuide() {
  const sections = [
    {
      icon: <ReportIcon color="#EF4444" />, // Red
      iconBg: "bg-red-50",
      hoverBorder: "hover:border-red-200 hover:shadow-red-100/50",
      title: "Reporting a Lost Item",
      content:
        "Misplaced something? Report it with exact location details. Crucially, you MUST provide a highly specific description with unique identifiers (e.g., scratches, stickers, serial numbers) so the AI can accurately find a match.",
    },
    {
      icon: <FoundIcon color="#10B981" />, // Green
      iconBg: "bg-green-50",
      hoverBorder: "hover:border-green-200 hover:shadow-green-100/50",
      title: "Reporting a Found Item",
      content:
        "Found something? Select 'Found'. Upload clear pictures but avoid publicly revealing extremely sensitive details (like a wallet's cash amount) for verification.",
    },
    {
      icon: <AIIcon color="#8B5CF6" />, // Purple
      iconBg: "bg-purple-50",
      hoverBorder: "hover:border-purple-200 hover:shadow-purple-100/50",
      title: "How AI Matching Works",
      content:
        "Advanced NLP AI calculates semantic match scores between categories and descriptions. High scores automatically trigger alerts to rightful owners.",
    },
    {
      icon: <ClaimIcon color="#3B82F6" />, // Blue
      iconBg: "bg-blue-50",
      hoverBorder: "hover:border-blue-200 hover:shadow-blue-100/50",
      title: "The Secure Claim Process",
      content:
        "To file a claim, you must provide solid proof of ownership. Describe unique, hidden identification details that only the true owner would know. Once approved, you'll receive a secure OTP.",
    },
    {
      icon: <TrustIcon color="#F59E0B" />, // Amber
      iconBg: "bg-amber-50",
      hoverBorder: "hover:border-amber-200 hover:shadow-amber-100/50",
      title: "Leaderboard & Trust Scores",
      content:
        "Honesty increases your Trust Score. Successful found item reports boost your reputation on the public campus community Leaderboard.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 border-b border-gray-100 pb-10">
          <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 mb-4 inline-block">
            Platform Guidelines
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-[#0B1F4D] tracking-tighter mb-4">
            How to use <span className="text-[#D4AF37]">TrackMate</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            Your comprehensive guide to reporting, matching, and securely
            claiming items across campus with our intelligent NLP-powered
            semantic analysis system.
          </p>
        </div>

        {/* Guide Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {sections.map((sec, index) => (
            <div
              key={index}
              className={`bg-white rounded-[2rem] p-8 shadow-lg shadow-gray-100/50 border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 ${sec.hoverBorder} ${
                index >= 3 ? "lg:col-span-1" : ""
              }`}
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-white shadow-sm ${sec.iconBg}`}
              >
                {sec.icon}
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-[#0B1F4D] mb-2 uppercase tracking-wide">
                  {sec.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-xs md:text-sm">
                  {sec.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="bg-[#0B1F4D] rounded-[2rem] p-10 text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <h4 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tighter">
              Ready to start?
            </h4>
            <p className="text-blue-200 text-xs md:text-sm mb-6 font-medium">
              Head over to the directory to see items or check your dashboard
              for active matches.
            </p>
            <a
              href="/lost"
              className="inline-block bg-[#D4AF37] text-[#0B1F4D] px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-md"
            >
              Go to Directory
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
