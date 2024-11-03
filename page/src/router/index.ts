import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import HookView from '@/views/HookView.vue'
import EnterpriseAssignView from '@/views/EnterpriseAssignView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/enterprise/assign', component: EnterpriseAssignView },
    { path: '/hook/:signature', component: HookView },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
  ],
})

export default router
