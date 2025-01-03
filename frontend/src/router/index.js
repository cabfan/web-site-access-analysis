import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard/index.vue')
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/Upload/index.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 