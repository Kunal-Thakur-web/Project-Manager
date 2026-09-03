import api from "./axiosClient";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/current-user"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (resetToken, newPassword) =>
    api.post(`/auth/reset-password/${resetToken}`, { newPassword }),
  changePassword: (oldPassword, newPassword) =>
    api.post("/auth/change-password", { oldPassword, newPassword }),
};
