import { createRouter, createWebHistory } from 'vue-router'
import GuestLayout from '@/views/layout/GuestLayout.vue'
import AuthenticatedLayout from '@/views/layout/AuthenticatedLayout.vue'
import UnauthorizedView from '@/views/guest/UnauthorizedView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: GuestLayout,
      children: [
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/guest/RegisterView.vue'),
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/guest/LoginView.vue'),
        },
        {
          path: 'unauthorized',
          name: 'unauthorized',
          component: UnauthorizedView,
        },
      ],
    },
    {
      path: '/',
      component: AuthenticatedLayout,
      children: [
        {
          path: 'sell',
          name: 'sell',
          component: () => import('../views/authenticated/SellView.vue'),
          meta: { requiresAuth: true, role: 'seller' },
        },
        {
          path: 'shop',
          name: 'shop',
          component: () => import('@/views/authenticated/ShopView.vue'),
          meta: { requiresAuth: true, role: 'buyer' },
        },
        {
          path: 'product/:id',
          name: 'ProductDetail',
          component: () => import('@/views/authenticated/ProductDetailView.vue'),
          props: true,
        }
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('account_type')

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login' })
  }

  if (to.meta.role && to.meta.role !== role) {
    return next({ name: 'unauthorized' })
  }

  next()
})

export default router