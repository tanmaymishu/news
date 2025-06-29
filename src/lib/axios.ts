import axios from 'axios';

const instance = axios.create({
  withCredentials: true,
  withXSRFToken: true,
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL
});

export const isAxiosError = axios.isAxiosError
export default instance;
