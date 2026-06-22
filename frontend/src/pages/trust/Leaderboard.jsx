import React, { useState, useEffect } from "react";
import { getLeaderboard } from "../../api/trustApi"; // 🚨 Corrected: Using API Layer

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await getLeaderboard(); // 🚨 Corrected: No hardcoded localhost

        // Admin Filter (Kept your FYP logic)
        const filteredData = response.data.filter((item) => {
          const isAdmin = item.user?.is_admin || item.is_admin;
          const email = item.user?.email || item.email;
          return !isAdmin && email !== "24017156-035@uog.edu.pk";
        });

        const formattedLeaders = filteredData.map((item, index) => {
          let badge = "⭐";
          if (index === 0) badge = "🥇";
          else if (index === 1) badge = "🥈";
          else if (index === 2) badge = "🥉";

          return {
            id: item.id || index,
            name: item.user?.full_name || item.full_name || `Student ${item.user_id}`,
            score: item.score,
            rank: index + 1,
            badge: badge,
          };
        });

        setLeaders(formattedLeaders);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 bg-gray-50 w-full">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

    return (
    <div className="p-8 md:p-12 bg-gray-50 w-full pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-black text-[#0B1F4D] uppercase tracking-tighter mb-4">
            Trust <span className="text-[#D4AF37]">Leaderboard</span>
          </h1>
          <p className="text-gray-500 font-bold text-xs md:text-sm uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
            Recognizing the most honest and helpful students on campus based on
            verified item returns.
          </p>
        </div>

        {leaders.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 md:gap-6 mb-12 items-end mt-10">
            <div
              className={`bg-white p-4 md:p-6 rounded-t-[2rem] rounded-b-xl shadow-lg border border-gray-100 flex flex-col items-center text-center relative h-[90%] border-t-4 border-t-gray-300 ${!leaders[1] ? "opacity-0" : ""}`}
            >
              <div className="text-4xl absolute -top-6 md:-top-8 bg-white rounded-full p-2 shadow-sm">
                🥈
              </div>
              <h3 className="text-sm md:text-lg font-black text-[#0B1F4D] mt-6">
                {leaders[1]?.name || "-"}
              </h3>
              <p className="text-gray-500 font-bold text-xs mt-1">
                Trust Score
              </p>
              <p className="text-[#D4AF37] font-black text-xl mt-1">
                {leaders[1]?.score || 0}
              </p>
            </div>

            <div className="bg-[#0B1F4D] p-6 rounded-t-[3rem] rounded-b-xl shadow-2xl flex flex-col items-center text-center relative h-full border-t-4 border-t-[#D4AF37] z-10 transform md:scale-110">
              <div className="text-5xl absolute -top-8 md:-top-10 bg-white rounded-full p-2 shadow-md">
                🥇
              </div>
              <h3 className="text-lg md:text-xl font-black text-white mt-8">
                {leaders[0]?.name || "No Leaders Yet"}
              </h3>
              {leaders[0] && (
                <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-2">
                  Campus Legend
                </span>
              )}
              <p className="text-[#D4AF37] font-black text-3xl mt-3">
                {leaders[0]?.score || 0}
              </p>
            </div>

            <div
              className={`bg-white p-4 md:p-6 rounded-t-[2rem] rounded-b-xl shadow-lg border border-gray-100 flex flex-col items-center text-center relative h-[80%] border-t-4 border-t-amber-600 ${!leaders[2] ? "opacity-0" : ""}`}
            >
              <div className="text-4xl absolute -top-6 md:-top-8 bg-white rounded-full p-2 shadow-sm">
                🥉
              </div>
              <h3 className="text-sm md:text-lg font-black text-[#0B1F4D] mt-6">
                {leaders[2]?.name || "-"}
              </h3>
              <p className="text-gray-500 font-bold text-xs mt-1">
                Trust Score
              </p>
              <p className="text-[#D4AF37] font-black text-xl mt-1">
                {leaders[2]?.score || 0}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-[2rem] shadow-sm mb-12">
            <p className="text-gray-500 font-bold">
              No ranking data available yet. Start reporting items to earn
              points!
            </p>
          </div>
        )}

        {leaders.length > 3 && (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
            {leaders.slice(3).map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-6 border-b border-gray-50 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-black text-gray-300 w-8 text-center">
                    {student.rank}
                  </span>
                  <span className="font-bold text-[#0B1F4D] text-sm md:text-lg">
                    {student.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden md:inline text-gray-500 font-bold text-xs uppercase">
                    Score:
                  </span>
                  <span className="bg-amber-50 text-[#D4AF37] px-4 py-1.5 rounded-full font-black text-[12px] uppercase border border-amber-100">
                    {student.badge} {student.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}