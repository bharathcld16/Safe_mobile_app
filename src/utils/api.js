import axios from 'axios';

// Change this to your server IP when testing on a real device
export const BASE_URL = 'http://192.168.0.231:3000';

const api = axios.create({ baseURL: BASE_URL });

export const registerUser = (formData) =>
  api.post('/api/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const subscribeUser = (userId, subscription) =>
  api.post('/api/subscribe', { userId, subscription });

export const updateLocation = (userId, lat, lng) =>
  api.post('/api/location', { userId, lat, lng });

export const sendSOS = (userId) =>
  api.post('/api/sos', { userId });

export const lookupUser = (phone) =>
  api.get(`/api/users/lookup?phone=${encodeURIComponent(phone)}`);

export default api;
