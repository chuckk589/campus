const AuthRoutes = {
  path: '/auth',
  component: () => import('../components/BlankLayout.vue'),
  meta: {
    requiresAuth: false,
  },
  redirect: '/auth/login',
  children: [
    {
      name: 'Login',
      path: '/auth/login',
      component: () => import('@/views/authentication/auth/LoginPage.vue'),
    },
    {
      name: 'Register',
      path: '/auth/register',
      component: () => import('@/views/authentication/auth/RegisterPage.vue'),
    },
  ],
};

export default AuthRoutes;
