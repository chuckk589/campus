import axios from 'axios';
import emitter from '../eventBus';
import { useAuthStore } from '../stores/auth';

const axiosInstance = axios.create({
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const { user, logout } = useAuthStore();
    if (!error.response.config.url.startsWith('/auth')) {
      if ([401, 403].includes(error.response.status) && user) {
        logout();
      } else {
        emitter.emit('alert', {
          header: error.message,
          color: 'error',
          text:
            typeof error.response.data.message == 'object'
              ? error.response.data.message.join('\n')
              : error.response.data.message,
        });
      }
    }
    return Promise.reject(error);
  },
);
axiosInstance.interceptors.request.use(function (config) {
  if (config.headers) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});
export default axiosInstance;
