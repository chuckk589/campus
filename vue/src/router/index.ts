import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../components/Container.vue'),
      redirect: '/users',
      children: [
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/Users.vue'),
        },
        {
          path: 'banned',
          name: 'banned',
          component: () => import('../views/Banlist.vue'),
        },
        {
          path: 'codes',
          name: 'codes',
          component: () => import('../views/Codes.vue'),
        },
        {
          path: 'answers',
          name: 'answers',
          component: () => import('../views/Answers.vue'),
        },
        {
          path: 'attempts',
          name: 'attempts',
          component: () => import('../views/Attempts.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/Settings.vue'),
        },
        {
          path: 'search',
          name: 'search',
          component: () => import('../views/Search.vue'),
        },
        {
          path: 'results',
          name: 'results',
          component: () => import('../views/Results.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
  ],
});

export default router;
