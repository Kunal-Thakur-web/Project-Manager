import api from "./axiosClient";

export const projectApi = {
  getAll: () => api.get("/projects"),
  getById: (projectId) => api.get(`/projects/${projectId}`),
  create: (payload) => api.post("/projects", payload),
  update: (projectId, payload) => api.put(`/projects/${projectId}`, payload),
  remove: (projectId) => api.delete(`/projects/${projectId}`),

  getMembers: (projectId) => api.get(`/projects/${projectId}/members`),
  addMember: (projectId, payload) =>
    api.post(`/projects/${projectId}/members`, payload),
  updateMemberRole: (projectId, userId, payload) =>
    api.put(`/projects/${projectId}/members/${userId}`, payload),
  removeMember: (projectId, userId, email) =>
    api.delete(`/projects/${projectId}/members/${userId}`, { data: { email } }),
};
