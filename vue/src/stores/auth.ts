import { defineStore } from 'pinia';
import { router } from '../router';
import axiosInstance from '@/utils/axios';
export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    user: JSON.parse(localStorage.getItem('user')),
    returnUrl: null,
  }),
  actions: {
    async login(username: string, password: string) {
      const user = await axiosInstance({
        method: 'POST',
        url: '/auth/login',
        data: { username, password },
      }).then((res) => res.data);
      // update pinia state
      this.user = user;
      console.log('user', user);
      // store user details and jwt in local storage to keep user logged in between page refreshes
      localStorage.setItem('user', JSON.stringify(user));
      // redirect to previous url or default to home page
      router.push(this.returnUrl || '/main/users');
    },
    async register(username: string, password: string) {
      const user = await axiosInstance({
        method: 'POST',
        url: '/auth/register',
        data: { username, password },
      }).then((res) => res.data);
      // update pinia state
      this.user = user;
      // store user details and jwt in local storage to keep user logged in between page refreshes
      localStorage.setItem('user', JSON.stringify(user));
      // redirect to previous url or default to home page
      router.push(this.returnUrl || '/main/users');
    },
    async logout() {
      this.user = null;
      localStorage.removeItem('user');
      await axiosInstance({
        method: 'GET',
        url: '/auth/logout',
      });
      router.push('/auth/login');
    },
  },
});
