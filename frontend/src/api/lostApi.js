import axios from "./axios";

export const getPublicLostItems = () => {
  return axios.get("/lost/");
};

export const getMyLostItems = () => {
  return axios.get("/lost/my");
};

export const getLostItemById = (id) => {
  return axios.get(`/lost/${id}`);
};

export const createLostItem = (data) => {
  // 🚨 Let Axios handle the headers automatically for FormData
  return axios.post("/lost/", data);
};

export const updateLostItem = (id, data) => {
  return axios.put(`/lost/${id}`, data);
};

export const deleteLostItem = (id) => {
  return axios.delete(`/lost/${id}`);
};
