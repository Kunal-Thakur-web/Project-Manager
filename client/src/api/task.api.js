import api from "./axiosClient";

export const taskApi = {
  getMyTasks: () => api.get("/tasks/my-tasks"),
  getForProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  getById: (projectId, taskId) =>
    api.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, payload) =>
    api.post(`/projects/${projectId}/tasks`, payload),
  update: (projectId, taskId, payload) =>
    api.put(`/projects/${projectId}/tasks/${taskId}`, payload),
  remove: (projectId, taskId) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`),
};
