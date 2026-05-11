import axios from "./axios";

// Public list
export const getPublicLostItems = () => {
  return axios.get("/lost/");
};

// My items
export const getMyLostItems = () => {
  return axios.get("/lost/my");
};

// Single item
export const getLostItemById = (id) => {
  return axios.get(`/lost/${id}`);
};

// ==========================================
// 🚨 CHANGED: Create (Added multipart/form-data header)
// ==========================================
export const createLostItem = (data) => {
  return axios.post("/lost/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete
export const deleteLostItem = (id) => {
  return axios.delete(`/lost/${id}`);
};

// ==========================================
// 🚨 CHANGED: Update (Added multipart/form-data header)
// ==========================================
export const updateLostItem = (id, data) => {
  return axios.put(`/lost/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
