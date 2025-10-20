import { createRouter, createWebHistory } from 'vue-router'
import GuestLayout from '@/views/layout/GuestLayout.vue'
import AuthenticatedLayout from '@/views/layout/AuthenticatedLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: GuestLayout,
      children: [
        {path: 'register', name: 'register', component: () => import('@/views/guest/RegisterView.vue')},
        {path: '/login', name: 'login', component: () => import('@/views/guest/LoginView.vue')},
      ],
    },
    {
      path: '/auth',
      component: AuthenticatedLayout,
      children: [
        {
          path: '/sell',
          name: 'sell',
          component: () => import('@/views/authenticated/SellView.vue'),
          authenticated: true
        },
        {
          path: '/shop',
          name: 'shop',
          component: () => import('@/views/authenticated/ShopView.vue')
        },
      ],
    }
  ],
})

export default router
