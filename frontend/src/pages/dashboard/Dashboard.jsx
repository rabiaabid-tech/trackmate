//Dashboard.jsx
import { Link, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import ItemCard from "../../components/ItemCard";
import { getPublicLostItems } from "../../api/lostApi";
import { getPublicFoundItems } from "../../api/foundApi";


export default function Dashboard() {
  const user = (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const [recentItems, setRecentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [lostRes, foundRes] = await Promise.all([
        getPublicLostItems(),
        getPublicFoundItems(),
      ]);

      const lostItems = (lostRes.data || []).map((item) => ({
        ...item,
        type: "lost",
      }));

      const foundItems = (foundRes.data || []).map((item) => ({
        ...item,
        type: "found",
      }));

      const merged = [...lostItems, ...foundItems]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 4);

      setRecentItems(merged);
    } catch (err) {
      console.error("Error fetching dashboard items", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.is_admin) {
      fetchRecentData();
    }
  }, [fetchRecentData, user?.is_admin]);

  if (user?.is_admin) {
    return <Navigate to="/admin/users" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Modern Hero Section */}
      <div className="bg-[#0B1F4D] py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Track Your Belongings.{" "}
            <span className="text-[#D4AF37]">Secure Your Campus.</span>
          </h1>
          <p className="text-blue-100 text-xl mb-10 leading-relaxed">
            {user
              ? `Welcome back, ${user.full_name || user.username}. What would you like to do today?`
              : "The official Lost & Found hub. Browse items or report a loss instantly."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to={user ? "/lost/create" : "/login"}
              className="bg-[#D4AF37] hover:bg-[#bfa032] text-[#0B1F4D] font-bold px-10 py-4 rounded-full shadow-lg transition-all transform hover:-translate-y-1"
            >
              Report Item
            </Link>
            <Link
              to="/lost"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold px-10 py-4 rounded-full transition-all"
            >
              Browse All Items
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-2xl">🔎</div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                Real-time Tracking
              </p>
              <p className="text-xl font-black text-[#0B1F4D]">
                UOG Active Hub
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-lg text-2xl">🏆</div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                Community Trust
              </p>
              <p className="text-xl font-black text-[#0B1F4D]">
                Verified Reports
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-lg text-2xl">🤝</div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                System Status
              </p>
              <p className="text-xl font-black text-[#0B1F4D]">85+ Reunited</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Items Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-[#0B1F4D] uppercase tracking-tighter">
              Recent <span className="text-[#D4AF37]">Listings</span>
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Freshly reported items on campus.
            </p>
          </div>
          <Link
            to="/lost"
            className="text-[#D4AF37] font-black uppercase text-xs tracking-widest hover:text-[#0B1F4D] transition-colors"
          >
            View Directory →
          </Link>
        </div>

        {/* Grid Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-80 bg-gray-200 animate-pulse rounded-[2.5rem]"
              ></div>
            ))
          ) : recentItems.length > 0 ? (
            recentItems.map((item) => (
              <ItemCard
                key={`${item.type}-${item.id}`}
                item={{
                  ...item,
                  title: item.item_name,
                  category: item.item_category,
                  // 🚨 Date mapping removed, minimal UI ahead
                }}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-black uppercase tracking-widest text-sm">
                No items reported yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
