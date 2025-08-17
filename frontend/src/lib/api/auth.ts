import { api } from "./client";

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  display_name?: string | null;
}

export interface LoginPayload {
  username_or_email: string;
  password: string;
}

export const AuthAPI = {
  signup: (data: SignupPayload) => api.post("/auth/signup", data).then((r) => r.data),
  login: (data: LoginPayload) => api.post("/auth/login", data).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

