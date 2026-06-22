import axios from "./axios";

export const getLeaderboard = () => {
  return axios.get("/trust/leaderboard");
};
