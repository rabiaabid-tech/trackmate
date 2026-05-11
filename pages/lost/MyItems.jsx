import { useEffect, useState, useCallback } from "react";
import { getMyLostItems, deleteLostItem } from "../../api/lostApi";
import { getMyFoundItems, deleteFoundItem } from "../../api/foundApi";
import { useNavigate } from "react-router-dom";

export default function MyLost() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("lost");
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res =
        activeTab === "lost" ? await getMyLostItems() : await getMyFoundItems();
      setItems(res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [activeTab, navigate]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      if (activeTab === "lost") {
        await deleteLostItem(deleteId);
      } else {
        await deleteFoundItem(deleteId);
      }
      setItems(items.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    } catch {
      alert("Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 🚨 NEW LOGIC: Backend URL append karne ke liye
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; // Agar pehle se full URL hai
    // Agar relative path hai, toh backend ka address lagao
    const cleanPath = path.replace(/\\/g, "/");
    const baseUrl = "http://localhost:8000";

    // Agar path pehle se '/' se shuru ho raha hai toh extra slash mat lagao
    return cleanPath.startsWith("/")
      ? `${baseUrl}${cleanPath}`
      : `${baseUrl}/${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="bg-white border-b border-gray-100 py-12 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#0B1F4D] tracking-tighter">
              My <span className="text-[#D4AF37]">Inventory</span>
            </h1>
            <div className="flex gap-4 mt-6 bg-gray-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("lost")}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === "lost" ? "bg-white text-[#0B1F4D] shadow-sm" : "text-gray-400"}`}
              >
                Lost Items
              </button>
              <button
                onClick={() => setActiveTab("found")}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === "found" ? "bg-white text-[#0B1F4D] shadow-sm" : "text-gray-400"}`}
              >
                Found Items
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate("/lost/create")}
            className="bg-[#0B1F4D] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#D4AF37] transition-all"
          >
            + Report New
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-64 bg-gray-200 animate-pulse rounded-[2.5rem]"
              ></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-200 py-32 text-center text-gray-400">
            No {activeTab} items reported yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {items.map((item) => {
              // 🚨 SMART CHECK: Item returned hai ya nahi
              const isReturned =
                item.status === "resolved" ||
                item.is_active === false ||
                item.status === "returned" ||
                item.status === "claimed";

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-[2.5rem] shadow-xl border border-transparent hover:border-[#D4AF37]/50 transition-all p-8 flex flex-col ${isReturned ? "opacity-90" : ""}`}
                >
                  {/* 🚨 UPDATED IMAGE LOGIC: Overlay wrapper added */}
                  <div className="relative mb-6">
                    {item.image_url ? (
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.item_name}
                        className={`w-full h-48 object-cover rounded-[1.5rem] border border-gray-100 ${isReturned ? "grayscale blur-[2px]" : ""}`}
                      />
                    ) : (
                      <div
                        className={`w-full h-48 bg-gray-50 rounded-[1.5rem] flex flex-col items-center justify-center border border-dashed border-gray-200 text-gray-400 ${isReturned ? "grayscale opacity-50" : ""}`}
                      >
                        <span className="text-3xl mb-2">📷</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          No Image
                        </span>
                      </div>
                    )}

                    {/* 🚨 PROFESSIONAL "RETURNED" OVERLAY */}
                    {isReturned && (
                      <div className="absolute inset-0 bg-[#0B1F4D]/40 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-[1.5rem]">
                        <div className="bg-white/95 px-5 py-2 rounded-full shadow-2xl flex items-center gap-2 transform -rotate-12 scale-110 border-2 border-green-500">
                          <span className="text-green-500 text-sm">✅</span>
                          <span className="text-green-700 font-black uppercase tracking-widest text-[10px]">
                            Returned
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${activeTab === "lost" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}
                    >
                      {activeTab} • {item.item_category}
                    </span>
                    <span className="text-[10px] font-bold text-gray-300">
                      TM-{item.id}
                    </span>
                  </div>

                  {/* Title strike-through if returned */}
                  <h2
                    className={`text-2xl font-black mb-4 ${isReturned ? "text-gray-400 line-through" : "text-[#0B1F4D]"}`}
                  >
                    {item.item_name}
                  </h2>

                  <div className="bg-gray-50 p-5 rounded-2xl mb-6 border border-gray-100 flex-grow">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Description
                    </p>
                    <p className="text-sm text-gray-600 italic line-clamp-3">
                      "{item.description || "No description provided."}"
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl text-sm font-bold text-[#0B1F4D] truncate">
                        📍 {item.location}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl text-sm font-bold text-[#0B1F4D]">
                        📅{" "}
                        {new Date(
                          item.created_at || item.date_lost || item.date_found,
                        ).toLocaleDateString("en-GB")}
                      </div>
                    </div>

                    {item.contact && (
                      <div className="bg-gray-50 p-4 rounded-2xl text-sm font-bold text-[#0B1F4D] truncate">
                        📞 {item.contact}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-50 mt-auto">
                    {/* 🚨 VIEW DETAILS BUTTON ADDED HERE */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate(`/${activeTab}/${item.id}`)}
                        className="text-xs font-black text-[#D4AF37] uppercase hover:text-[#0B1F4D] transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/${activeTab}/edit/${item.id}`)
                        }
                        className="text-xs font-black text-[#0B1F4D] uppercase hover:text-[#D4AF37] transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="text-red-500 text-[10px] font-black uppercase hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-[#0B1F4D]/90 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md text-center">
            <h3 className="text-2xl font-black text-[#0B1F4D] mb-4">
              DELETE {activeTab.toUpperCase()}?
            </h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                className="py-5 rounded-2xl bg-red-600 text-white font-black text-xs uppercase hover:bg-red-700 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="py-5 rounded-2xl bg-gray-100 text-gray-500 font-black text-xs uppercase hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
