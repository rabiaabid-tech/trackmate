import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getLostItemById, updateLostItem } from "../../api/lostApi";
import { getFoundItemById, updateFoundItem } from "../../api/foundApi";

export default function EditLost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isFoundType = pathname.includes("/found/");

  const [form, setForm] = useState({
    item_name: "",
    description: "",
    location: "",
    item_category: "",
    contact: "",
    date_lost: "",
  });

  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const fetchItem = useCallback(async () => {
    setFetching(true);
    try {
      const res = isFoundType
        ? await getFoundItemById(id)
        : await getLostItemById(id);
      const data = res.data;

      setForm({
        item_name: data.item_name || "",
        description: data.description || "",
        location: data.location || "",
        item_category: data.item_category || "",
        contact: data.contact || "",
        date_lost:
          (isFoundType ? data.date_found : data.date_lost)?.split("T")[0] || "",
      });

      if (data.image_url) setPreview(data.image_url);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Item not found or Unauthorized.");
    } finally {
      setFetching(false);
    }
  }, [id, isFoundType]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("item_name", form.item_name);
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("item_category", form.item_category);
      formData.append("contact", form.contact || "");

      if (form.date_lost) {
        const dateKey = isFoundType ? "date_found" : "date_lost";
        formData.append(dateKey, new Date(form.date_lost).toISOString());
      }

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      if (isFoundType) {
        await updateFoundItem(id, formData);
      } else {
        await updateLostItem(id, formData);
      }

      navigate("/lost/my");
    } catch (err) {
      setError(err.response?.data?.detail || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="bg-white border-b py-12 px-6 mb-12 text-center">
        <h1 className="text-4xl font-black text-[#0B1F4D]">
          Edit{" "}
          <span className="text-[#D4AF37]">
            {isFoundType ? "Found" : "Lost"}
          </span>{" "}
          Report
        </h1>
        <p className="text-gray-400 mt-2 font-bold uppercase text-[10px] tracking-widest">
          Ref: TM-{id}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden">
          <div className="h-2 bg-[#D4AF37]"></div>
          <div className="p-8 md:p-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    value={form.item_name}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Category
                  </label>
                  <select
                    name="item_category"
                    value={form.item_category}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#D4AF37]"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="stationery">Stationery</option>
                    <option value="bags">Bags</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date_lost"
                    value={form.date_lost}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* 🚨 CONTACT INFO FIELD ADDED HERE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Contact Info
                </label>
                <input
                  type="text"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Phone number or Social Media Handle (Optional)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none resize-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Update Photo
                </label>
                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-xl shadow-md border-2 border-white"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs text-gray-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-4 rounded-xl text-xs font-black uppercase text-gray-400 hover:text-[#0B1F4D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0B1F4D] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-lg"
                >
                  {loading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
