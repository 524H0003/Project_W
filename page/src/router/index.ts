import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import SignupView from '@/views/SignupView.vue'
import HookView from '@/views/HookView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/signup', component: SignupView },
    { path: '/hook/:signature', component: HookView },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
  ],
})

export default router
