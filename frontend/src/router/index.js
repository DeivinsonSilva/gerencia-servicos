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
    meta: { requiresAdmin: true } // Etiqueta de Admin
  },
  { 
    path: '/admin', 
    name: 'admin-dashboard', 
    component: AdminDashboardView,
    meta: { requiresAdmin: true } // Etiqueta de Admin
  }
];

const router = createRouter({
  // --- A CORREÇÃO ESTÁ AQUI --- Nesse contexto.
  history: createWebHistory(), // Removido o argumento 'import.meta.url'
  routes
});

// --- NOSSO "SEGURANÇA" DE ROTAS APRIMORADO ---
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('authToken');
    const isUserLoggedIn = !!token;

    // 1. Se o usuário não está logado e a página não é a de login, redireciona para o login.
    if (!isUserLoggedIn && to.name !== 'login') {
        return next({ name: 'login' });
    }

    // 2. Se o usuário está logado e tenta acessar a página de login, redireciona para o dashboard.
    if (isUserLoggedIn && to.name === 'login') {
        return next({ name: 'dashboard' });
    }

    // 3. Se a rota exige permissão de Admin
    if (to.meta.requiresAdmin) {
        if (isUserLoggedIn) {
            try {
                const decodedToken = jwtDecode(token);
                const userRole = decodedToken.user.role;
                
                if (userRole === 'Admin') {
                    return next(); // Permite o acesso
                } else {
                    console.warn('Acesso negado: Rota apenas para administradores.');
                    return next({ name: 'dashboard' }); // Redireciona se não for Admin
                }
            } catch (e) {
                console.error("Token inválido ou expirado:", e);
                // Se o token for inválido, limpa e redireciona para o login
                localStorage.removeItem('authToken');
                return next({ name: 'login' });
            }
        }
    }

    // 4. Para todas as outras situações, permite a navegação.
    return next();
});

export default router;
