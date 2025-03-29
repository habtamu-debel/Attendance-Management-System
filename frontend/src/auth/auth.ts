import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  useToken: boolean = false,
  headers: Record<string, string> = {}
) => {
  const token = localStorage.getItem('token');
  if (useToken && !token) throw new Error('No token found');
  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers: {
      ...(useToken ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    data,
  };
  try {
    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.detail || error.message;
  }
};

export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  const data = await apiRequest('/login/', 'POST', formData, false, {
    'Content-Type': 'application/x-www-form-urlencoded',
  });
  localStorage.setItem('token', data.access_token);
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getToken = () => localStorage.getItem('token');