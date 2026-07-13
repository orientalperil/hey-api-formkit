import { createRouter, createWebHistory } from 'vue-router'

import { getToken } from '@/auth-token'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      meta: { public: true },
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue'),
    },
    {
      path: '/products/new',
      name: 'product-create',
      component: () => import('@/views/CreateProductView.vue'),
    },
    {
      path: '/products/:id/edit',
      name: 'product-edit',
      component: () => import('@/views/EditProductView.vue'),
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/OrdersView.vue'),
    },
    {
      path: '/orders/new',
      name: 'order-create',
      component: () => import('@/views/CreateOrderView.vue'),
    },
    {
      path: '/orders/:id/edit',
      name: 'order-edit',
      component: () => import('@/views/EditOrderView.vue'),
    },
  ],
})

// Auth guard: every route except those marked `public` needs a token.
// Unauthenticated visitors are redirected to /login (preserving the target).
router.beforeEach((to) => {
  const authed = getToken() !== null
  if (!to.meta.public && !authed) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && authed) {
    return { path: '/' }
  }
})

export default router
