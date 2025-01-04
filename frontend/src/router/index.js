import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard/index.vue'
import Upload from '@/views/Upload/index.vue'
import History from '@/views/History/index.vue'
import Settings from '@/views/Settings/index.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Dashboard
    },
    {
      path: '/upload',
      component: Upload
    },
    {
      path: '/history',
      component: History
    },
    {
      path: '/settings',
      component: Settings
    }
  ]
}) 