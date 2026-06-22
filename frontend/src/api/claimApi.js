import axios from "./axios"; // The centralized instance

export const getMyClaims = () => {
  return axios.get("/claims/");
};

export const approveClaim = (claimId) => {
  return axios.put(`/claims/${claimId}/approve`);
};

export const rejectClaim = (claimId) => {
  return axios.put(`/claims/${claimId}/reject`);
};

export const verifyClaim = (claimId, code) => {
  return axios.post(`/claims/${claimId}/verify`, { code });
};
