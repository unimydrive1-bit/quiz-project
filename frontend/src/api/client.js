import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

client.interceptors.request.use((config) => {
  const raw = localStorage.getItem("authTokens");
  if (raw) {
    try {
      const tokens = JSON.parse(raw);
      if (tokens.access) {
        config.headers.Authorization = `Bearer ${tokens.access}`;
      }
    } catch (e) {
      console.error("Failed to parse authTokens", e);
    }
  }
  return config;
});

export default client;
