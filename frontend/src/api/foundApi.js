import axios from "./axios";

export const getPublicFoundItems = () => {
  return axios.get("/found/");
};

export const getMyFoundItems = () => {
  return axios.get("/found/my");
};

export const getFoundItemById = (id) => {
  return axios.get(`/found/${id}`);
};

export const createFoundItem = (formData) => {
  // 🚨 Axios will automatically set the multipart header and boundary for FormData
  return axios.post("/found/", formData);
};

export const updateFoundItem = (id, formData) => {
  return axios.put(`/found/${id}`, formData);
};

export const deleteFoundItem = (id) => {
  return axios.delete(`/found/${id}`);
};
