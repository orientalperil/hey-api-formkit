import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
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
      path: '/orders/new',
      name: 'order-create',
      component: () => import('@/views/CreateOrderView.vue'),
    },
  ],
})

export default router
