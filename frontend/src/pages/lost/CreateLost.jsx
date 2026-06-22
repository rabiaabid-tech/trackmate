//CreateLost.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLostItem } from "../../api/lostApi";
import { createFoundItem } from "../../api/foundApi";

export default function CreateLost() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    item_name: "",
    description: "",
    location: "",
    item_category: "",
    contact: "", 
    date_lost: "",
    type: "lost",
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    setSelectedImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.description.length < 20) {
      setError("Description must be at least 20 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("item_name", form.item_name);
      formData.append("item_category", form.item_category);
      formData.append("location", form.location);
      formData.append("description", form.description);
      formData.append("contact", form.contact || "");

      if (form.date_lost) {
        const dateKey = form.type === "lost" ? "date_lost" : "date_found";
        formData.append(dateKey, new Date(form.date_lost).toISOString());
      }

      if (selectedImageFile) {
        formData.append("image", selectedImageFile);
      }

      if (form.type === "lost") {
        await createLostItem(formData);
      } else {
        await createFoundItem(formData);
      }

      navigate("/lost/my");
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.detail || "Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F9FAFB] pb-20 w-full">
      <div className="bg-white border-b border-gray-100 pt-0 pb-8 px-6 mb-12 text-center">
        <h1 className="text-4xl font-black text-[#0B1F4D]">
          Report <span className="text-[#D4AF37]">Campus Item</span>
        </h1>
        <p className="text-gray-500 mt-2 font-medium italic">
          "Help the community by reporting what's lost or found."
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden">
          <div className="h-2 bg-[#D4AF37]"></div>
          <div className="p-8 md:p-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Type Selection Tabs */}
              <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "lost" })}
                  className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${form.type === "lost" ? "bg-white text-[#0B1F4D] shadow-md" : "text-gray-400"}`}
                >
                  I Lost Something ❓
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "found" })}
                  className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${form.type === "found" ? "bg-white text-[#0B1F4D] shadow-md" : "text-gray-400"}`}
                >
                  I Found Something 🎁
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-[#0B1F4D] uppercase mb-2 tracking-widest">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    value={form.item_name}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:border-[#D4AF37] outline-none transition-all"
                    placeholder="What did you find/lose?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#0B1F4D] uppercase mb-2 tracking-widest">
                    Category *
                  </label>
                  <select
                    name="item_category"
                    value={form.item_category}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:border-[#D4AF37] outline-none"
                  >
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="stationery">Stationery</option>
                    <option value="documents">Documents</option>
                    <option value="accessories">Accessories</option>
                    <option value="clothing">Clothing</option>
                    <option value="bags">Bags</option>
                    <option value="keys">Keys</option>
                    <option value="cards">Cards</option>
                    <option value="personal_items">Personal Items</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-[#0B1F4D] uppercase mb-2 tracking-widest">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:border-[#D4AF37] outline-none"
                    placeholder="Where?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#0B1F4D] uppercase mb-2 tracking-widest">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date_lost"
                    value={form.date_lost}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase mb-2 tracking-widest">
                  Contact Number{" "}
                  <span className="text-gray-400 normal-case tracking-normal font-medium"></span>{" "}
                  *
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:border-[#D4AF37] outline-none transition-all"
                  placeholder="e.g. 0300-1234567 or email@student.edu"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase mb-2 tracking-widest">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:border-[#D4AF37] outline-none resize-none"
                  placeholder="Provide key details..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#0B1F4D] uppercase mb-2 tracking-widest">
                  Image Upload
                </label>
                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-xl border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                      📸
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#0B1F4D] file:text-white hover:file:bg-[#D4AF37] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-50">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0B1F4D] text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#0B1F4D] transition-all shadow-xl active:scale-95"
                >
                  {loading ? "Processing..." : "Publish Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
