import axios from 'axios';

const instance = axios.create({
  withCredentials: true,
  withXSRFToken: true,
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL
});

instance.interceptors.response.use(function (res) {
  return res;
}, async function (error) {
  if (error.response?.status === 403 && error.response?.data.message === 'Your email address is not verified.') {
    import('next/navigation').then(({redirect}) => redirect('/verify-email'));
  }

  // if (error.response?.status === 403) {
  //   import('next/navigation').then(({redirect}) => redirect('/verify-email'));
  // }
  return Promise.reject(error);
})

export const isAxiosError = axios.isAxiosError
export default instance;
