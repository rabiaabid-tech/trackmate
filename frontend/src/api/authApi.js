// src/api/authApi.js
import axios from "./axios";

export const loginWithGoogle = async (idToken) => {

  return await axios.post("/auth/google", {
    token: idToken,
  });
};
