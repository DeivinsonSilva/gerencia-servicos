import { createRouter, createWebHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode';

// Importa as Views
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import ServicesView from '../views/ServicesView.vue'
import FarmsView from '../views/FarmsView.vue'
import UsersView from '../views/UsersView.vue'
import WorkersView from '../views/WorkersView.vue'
import DailyLogView from '../views/DailyLogView.vue'
import ReportsView from '../views/ReportsView.vue'
import PayslipView from '../views/PayslipView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
import SuggestionsView from '../views/SuggestionsView.vue' // <-- 1. IMPORTA A NOVA VIEW

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  { path: '/', name: 'dashboard', component: DashboardView },
  { path: '/registro-diario', name: 'daily-log', component: DailyLogView },
  { path: '/relatorios', name: 'reports', component: ReportsView },
  { path: '/folha-pagamento', name: 'payslip', component: PayslipView },
  { path: '/servicos', name: 'services', component: ServicesView },
  { path: '/fazendas', name: 'farms', component: FarmsView },
  { path: '/trabalhadores', name: 'workers', component: WorkersView },
  { path: '/meu-perfil', name: 'profile', component: ProfileView },
  
  // --- ROTAS PROTEGIDAS PARA ADMINS ---
  { 
    path: '/usuarios', 
    name: 'users', 
    component: UsersView,
    meta: { requiresAdmin: true }
  },
  { 
    path: '/admin', 
    name: 'admin-dashboard', 
    component: AdminDashboardView,
    meta: { requiresAdmin: true }
  },
  { 
    path: '/sugestoes', // <-- 2. ADICIONA A NOVA ROTA
    name: 'suggestions', 
    component: SuggestionsView,
    meta: { requiresAdmin: true } // Usa a mesma proteção de Admin
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// O seu "segurança" de rotas (router.beforeEach) já está perfeito 
// e vai proteger a nova rota automaticamente, pois ela tem "meta: { requiresAdmin: true }".
// Nenhuma alteração é necessária aqui.
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('authToken');
    const isUserLoggedIn = !!token;

    if (!isUserLoggedIn && to.name !== 'login') {
        return next({ name: 'login' });
    }

    if (isUserLoggedIn && to.name === 'login') {
        return next({ name: 'dashboard' });
    }

    if (to.meta.requiresAdmin) {
        if (isUserLoggedIn) {
            try {
                const decodedToken = jwtDecode(token);
                const userRole = decodedToken.user.role;
                
                if (userRole === 'Admin') {
                    return next();
                } else {
                    console.warn('Acesso negado: Rota apenas para administradores.');
                    return next({ name: 'dashboard' });
                }
            } catch (e) {
                console.error("Token inválido ou expirado:", e);
                localStorage.removeItem('authToken');
                return next({ name: 'login' });
            }
        }
    }

    return next();
});

export default router;