import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import ChangePasswordView from '@/views/ChangePassword.vue';
import EnterpriseAssignView from '@/views/EnterpriseAssignView.vue';
import EmployeeSignUpView from '@/views/EmployeeSignUpView.vue';
import FacultyAssignView from '@/views/FacultyAssignView.vue';
import EventAssignView from '@/views/EventAssignView.vue';
import EventUpdateView from '@/views/EventUpdateView.vue';
import FrontPageView from '@/views/FrontPageView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/enterprise/assign', component: EnterpriseAssignView },
    { path: '/employee/signup', component: EmployeeSignUpView },
    { path: '/change-password/:signature', component: ChangePasswordView },
    { path: '/faculty/assign', component: FacultyAssignView },
    { path: '/event/assign', component: EventAssignView },
    { path: '/event/update', component: EventUpdateView },
    { path: '/', component: FrontPageView },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
  ],
});
export default router;
