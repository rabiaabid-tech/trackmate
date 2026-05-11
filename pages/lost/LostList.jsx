import { useEffect, useState, useCallback } from "react";
import { getPublicLostItems } from "../../api/lostApi";
import { getPublicFoundItems } from "../../api/foundApi";
import ItemCard from "../../components/ItemCard";

export default function LostList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all_categories"); // 🚨 Naya Category State
  const [isLoading, setIsLoading] = useState(true);

  // Logic: Dono APIs ko parallel fetch karna
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [lostRes, foundRes] = await Promise.all([
        getPublicLostItems(),
        getPublicFoundItems(),
      ]);

      // Lost items mapping
      const lostItems = (lostRes.data || []).map((item) => ({
        ...item,
        type: "lost",
      }));

      // Found items mapping
      const foundItems = (foundRes.data || []).map((item) => ({
        ...item,
        type: "found",
      }));

      // Merge both arrays
      setItems([...lostItems, ...foundItems]);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredItems = items.filter((item) => {
    // 1. Search Logic
    const searchString = search.toLowerCase();
    const matchesSearch =
      item.item_name?.toLowerCase().includes(searchString) ||
      item.location?.toLowerCase().includes(searchString);

    // 2. Tab Logic (Lost/Found/All)
    const matchesTab = activeTab === "all" || item.type === activeTab;

    // 3. Category Logic
    const matchesCategory =
      categoryFilter === "all_categories" ||
      item.item_category?.toLowerCase() === categoryFilter;

    // Teeno conditions true hongi tab hi item show hoga
    return matchesSearch && matchesTab && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-gray-100 py-12 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-[#0B1F4D] tracking-tighter mb-4">
          Campus <span className="text-[#D4AF37]">Directory</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto italic font-medium">
          "Connecting lost items with their rightful owners."
        </p>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white p-3 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-3 items-center">
          {/* 1. SEARCH BAR */}
          <div className="relative flex-grow w-full">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by item name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-[#D4AF37] outline-none text-[#0B1F4D] transition-all font-medium"
            />
          </div>

          {/* 🚨 2. CATEGORY DROPDOWN FILTER */}
          <div className="w-full md:w-auto relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-48 px-5 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-[#D4AF37] outline-none text-[#0B1F4D] transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1em",
              }}
            >
              <option value="all_categories">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="documents">Documents</option>
              <option value="stationery">Stationery</option>
              <option value="accessories">Accessories</option>
              <option value="others">Others</option>
            </select>
          </div>

          {/* 3. TABS (ALL / LOST / FOUND) */}
          <div className="flex bg-gray-50 p-1 rounded-2xl w-full md:w-auto border border-gray-100">
            {["all", "lost", "found"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? "bg-white text-[#0B1F4D] shadow-sm border border-gray-200"
                    : "text-gray-400 hover:text-[#0B1F4D]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ITEMS GRID */}
        <div className="mt-12">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white p-4 rounded-[2.5rem] h-80 animate-pulse border border-gray-100"
                ></div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <ItemCard
                  key={`${item.type}-${item.id}`} // Unique key for merged list
                  item={{
                    ...item,
                    title: item.item_name,
                    category: item.item_category,
                    date: item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "Recent",
                    // Dynamic color coding based on type
                    typeColor:
                      item.type === "lost"
                        ? "text-orange-500 bg-orange-50"
                        : "text-green-600 bg-green-50",
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
              <span className="text-5xl block mb-4">🏜️</span>
              <h3 className="text-xl font-bold text-[#0B1F4D] uppercase tracking-widest">
                No results found
              </h3>
              <p className="text-gray-400 mt-2">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
