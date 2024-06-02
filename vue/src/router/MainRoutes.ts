const MainRoutes = {
  path: '/main',
  component: () => import('../components/Container.vue'),
  meta: {
    requiresAuth: true,
  },
  redirect: '/main/users',
  children: [
    {
      path: '/main/owners',
      name: 'owners',
      component: () => import('../views/Owners.vue'),
    },
    {
      path: '/main/users',
      name: 'users',
      component: () => import('../views/Users.vue'),
    },
    {
      path: '/main/banned',
      name: 'banned',
      component: () => import('../views/Banlist.vue'),
    },
    {
      path: '/main/codes',
      name: 'codes',
      component: () => import('../views/Codes.vue'),
    },
    {
      path: '/main/answers',
      name: 'answers',
      component: () => import('../views/Answers.vue'),
    },
    {
      path: '/main/attempts',
      name: 'attempts',
      component: () => import('../views/Attempts.vue'),
    },
    {
      path: '/main/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
    },
    {
      path: '/main/search',
      name: 'search',
      component: () => import('../views/Search.vue'),
    },
    {
      path: '/main/results',
      name: 'results',
      component: () => import('../views/Results.vue'),
    },
  ],
};

export default MainRoutes;
