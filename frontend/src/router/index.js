// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import ServicesView from '../views/ServicesView.vue'
import FarmsView from '../views/FarmsView.vue'
import UsersView from '../views/UsersView.vue'
import WorkersView from '../views/WorkersView.vue'
import DailyLogView from '../views/DailyLogView.vue';

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  { path: '/', name: 'dashboard', component: DashboardView },
  { path: '/servicos', name: 'services', component: ServicesView },
  { path: '/fazendas', name: 'farms', component: FarmsView },
  { path: '/usuarios', name: 'users', component: UsersView },
  { path: '/trabalhadores', name: 'workers', component: WorkersView },
  { path: '/trabalhadores', name: 'workers', component: WorkersView },
  { path: '/registro-diario', name: 'daily-log', component: DailyLogView }
];

// O resto do arquivo continua igual...
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
    // ... (lógica de autenticação)
    const token = localStorage.getItem('authToken');
    const isUserLoggedIn = !!token;
    if (to.name !== 'login' && !isUserLoggedIn) {
        next({ name: 'login' });
    } else if (to.name === 'login' && isUserLoggedIn) {
        next({ name: 'dashboard' });
    } else {
        next();
    }
});

export default router;