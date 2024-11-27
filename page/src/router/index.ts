import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import HookView from '@/views/HookView.vue'
import EnterpriseAssignView from '@/views/EnterpriseAssignView.vue'
import EmployeeSignUpView from '@/views/EmployeeSignUpView.vue'
import FacultyAssignView from '@/views/FacultyAssignView.vue'
import EventAssignView from '@/views/EventAssignView.vue'
import EventUpdateView from '@/views/EventUpdateView.vue'
import AdminRequestSignatureView from '@/views/AdminRequestSignatureView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/enterprise/assign', component: EnterpriseAssignView },
    { path: '/employee/signup', component: EmployeeSignUpView },
    { path: '/hook/:signature', component: HookView },
    { path: '/faculty/assign', component: FacultyAssignView },
    { path: '/event/assign', component: EventAssignView },
    { path: '/event/update', component: EventUpdateView },
    { path: '/request-signature', component: AdminRequestSignatureView },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
  ],
})

export default router
