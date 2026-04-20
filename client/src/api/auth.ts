import axios from 'axios';

const baseURL = '/api/auth';

export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await axios.post(`${baseURL}/login`, { email, password });
    return data;
  },
  register: async (name: string, email: string, password: string) => {
    const { data } = await axios.post(`${baseURL}/register`, { name, email, password });
    return data;
  },
  getMe: async (token: string) => {
    const { data } = await axios.get(`${baseURL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await axios.post(`${baseURL}/forgot-password`, { email });
    return data;
  },
  resetPassword: async (token: string, password: string) => {
    const { data } = await axios.post(`${baseURL}/reset-password`, { token, password });
    return data;
  },
};
