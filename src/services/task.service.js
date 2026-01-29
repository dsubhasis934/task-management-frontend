import api from './api.service';

export const getTasks = async (params = {}) => {
  const { data } = await api.get('/task', { params });
  return data;
};

export const getTask = async (id) => {
  const { data } = await api.get(`/task/${id}`);
  return data;
};

export const createTask = async (payload) => {
  const { data } = await api.post('/task', payload);
  return data;
};

export const updateTask = async (id, payload) => {
  const { data } = await api.put(`/task/${id}`, payload);
  return data;
};

export const deleteTask = async (id) => {
  const { data } = await api.delete(`/task/${id}`);
  return data;
};

// Admin endpoints
export const getAdminDashboard = async () => {
  const { data } = await api.get('/task/admin/dashboard');
  return data;
};

export const assignTaskToUsers = async (payload) => {
  const { data } = await api.post('/task/admin/assign', payload);
  return data;
};

export const adminUpdateTask = async (id, payload) => {
  const { data } = await api.put(`/task/admin/${id}`, payload);
  return data;
};

export const adminDeleteTask = async (id) => {
  const { data } = await api.delete(`/task/admin/${id}`);
  return data;
};

export const getUserTasks = async (userId, params = {}) => {
  const { data } = await api.get(`/task/admin/user/${userId}`, { params });
  return data;
};
