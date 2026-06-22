import axios from "./axios";

export const getRecommendationsForLost = async (lostItemId) => {
  return await axios.get(`/recommend/lost/${lostItemId}`);
};
