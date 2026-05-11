import { Link } from "react-router-dom";

export default function ItemCard({ item }) {
  const user = (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  // 🚨 SMART CHECK: Yahan apne backend ke hisaab se condition set karo.
  const isReturned =
    item.status === "resolved" ||
    item.is_active === false ||
    item.status === "returned" ||
    item.status === "claimed";

  const detailPath =
    item.type === "found" ? `/found/${item.id}` : `/lost/${item.id}`;

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

    if (cat.includes("accessory") || cat.includes("accessories"))
      return { icon: "💍", bg: "from-pink-100 to-rose-200" };

    return { icon: "📦", bg: "from-gray-100 to-gray-200" };
  };

  const catStyle = getCategoryStyle(item.category);

  return (
    <Link
      to={detailPath}
      className={`group bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-transparent hover:border-[#D4AF37]/40 transition-all duration-500 overflow-hidden flex flex-col h-full relative ${isReturned ? "opacity-90" : ""}`}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${isReturned ? "grayscale blur-[2px]" : "group-hover:scale-110"}`}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${catStyle.bg} ${isReturned ? "grayscale opacity-50" : ""}`}
          >
            <span
              className={`text-7xl drop-shadow-md transition-transform duration-500 ${isReturned ? "" : "group-hover:scale-110 group-hover:rotate-6"}`}
            >
              {catStyle.icon}
            </span>
          </div>
        )}

        {/* PROFESSIONAL "RETURNED" OVERLAY */}
        {isReturned && (
          <div className="absolute inset-0 bg-[#0B1F4D]/40 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="bg-white/95 px-5 py-2 rounded-full shadow-2xl flex items-center gap-2 transform -rotate-12 scale-110 border-2 border-green-500">
              <span className="text-green-500 text-sm">✅</span>
              <span className="text-green-700 font-black uppercase tracking-widest text-[10px]">
                Returned
              </span>
            </div>
          </div>
        )}

        {/* Type Badge */}
        <div
          className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg z-20 ${
            item.type === "found"
              ? "bg-green-500 text-white"
              : "bg-orange-500 text-white"
          }`}
        >
          {item.type}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-grow">
        {/* 🚨 REPORTER INFO (VISIBLE ONLY TO ADMINS) 🚨 */}
        {user?.is_admin && item.user && (
          <div className="mb-4 bg-red-50/50 p-3 rounded-xl border border-red-100 shadow-sm">
            <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1">
              <span className="text-[10px]">🛡️</span> Reported By
            </p>
            <p className="text-xs font-bold text-[#0B1F4D] truncate">
              {item.user.full_name || "Unknown"}
            </p>
            <p className="text-[10px] font-medium text-gray-500 truncate">
              {item.user.email}
            </p>
          </div>
        )}

        <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-2">
          {item.category}
        </p>
        <h3
          className={`text-xl font-black mb-4 transition-colors line-clamp-1 ${isReturned ? "text-gray-400 line-through" : "text-[#0B1F4D] group-hover:text-[#D4AF37]"}`}
        >
          {item.title}
        </h3>

        <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
          <span
            className={`text-[10px] font-black uppercase tracking-widest transition-transform ${isReturned ? "text-gray-400" : "text-[#0B1F4D] group-hover:translate-x-2"}`}
          >
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
