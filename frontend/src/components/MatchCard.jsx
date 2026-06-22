import { useNavigate } from "react-router-dom";

export default function MatchCard({ match }) {
  const navigate = useNavigate();

  // Color coding based on AI confidence score
  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-gray-100 text-gray-500 border-gray-200";
  };

  return (
    <div
      onClick={() => navigate(`/found/${match.id}`)}
      className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 cursor-pointer hover:border-[#D4AF37]/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full group"
    >
      <div className="flex justify-between items-start mb-4">
        <span
          className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${getScoreColor(
            match.match_score,
          )}`}
        >
          {match.match_score}% Match
        </span>
        {match.date_found && (
          <span className="text-[10px] font-bold uppercase text-gray-400">
            {new Date(match.date_found).toLocaleDateString()}
          </span>
        )}
      </div>

      <h4 className="text-lg font-black text-[#0B1F4D] mb-1 group-hover:text-[#D4AF37] transition-colors line-clamp-1">
        {match.item_name}
      </h4>
      <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-4">
        {match.item_category}
      </p>

      <div className="mt-auto bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs font-bold text-[#0B1F4D] flex items-center">
        <span className="mr-2 text-base">📍</span> {match.location}
      </div>
    </div>
  );
}
