import axios from "./axios";

export const getAllUsers = () => axios.get("/users/admin/users");
export const toggleBlockUser = (userId, status) =>
  axios.patch(`/users/admin/users/${userId}/block`, { is_blocked: status });
export const getAdminClaims = () => axios.get("/claims/");
export const updateClaimStatus = (claimId, status) =>
  axios.put(`/claims/${claimId}/status?status=${status}`);
export const getAdminStats = () => axios.get("/trust/stats");
export const updateUserScore = (userId, value) =>
  axios.post(`/trust/update/${userId}`, { value });
