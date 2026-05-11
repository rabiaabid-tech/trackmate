import axios from "./axios";

// 1. Get all public found items (Backend rasta: GET /found/)
export const getPublicFoundItems = () => {
  return axios.get("/found/"); // 🚨 Added slash to match backend
};

// 2. Get logged-in user's found items (Backend rasta: GET /found/my)
export const getMyFoundItems = () => {
  return axios.get("/found/my");
};

// 3. Get a single found item detail (Backend rasta: GET /found/{id})
export const getFoundItemById = (id) => {
  return axios.get(`/found/${id}`);
};

// 4. Create a new found item report (Backend rasta: POST /found/)
export const createFoundItem = (formData) => {
  // 🚨 FIX: Backend mein path @router.post("/") hai, isliye sirf "/found/" bhejien
  return axios.post("/found/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 5. Update a found item (Backend rasta: PUT /found/{id})
export const updateFoundItem = (id, formData) => {
  return axios.put(`/found/${id}`, formData);
};

// 6. Delete a found item (Backend rasta: DELETE /found/{id})
export const deleteFoundItem = (id) => {
  return axios.delete(`/found/${id}`);
};
