import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/";

export const api = axios.create({
  baseURL,
  withCredentials: true, // send/receive HttpOnly cookie
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Surface minimal error info
    return Promise.reject(
      err?.response?.data ?? { message: err.message ?? "Request failed" }
    );
  }
);

