// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { currentUser } from '@/data/store.js'

import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue' // Importa a nova página
import ServicesView from '../views/ServicesView.vue'
import FarmsView from '../views/FarmsView.vue'
import UsersView from '../views/UsersView.vue'

const routes = [
  {
    path: '/login', // Rota para a página de login
    name: 'login',
    component: LoginView
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView
  },
  { path: '/servicos', name: 'services', component: ServicesView },
  { path: '/fazendas', name: 'farms', component: FarmsView },
  { path: '/usuarios', name: 'users', component: UsersView }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// GUARDA DE NAVEGAÇÃO (O "PORTEIRO")
router.beforeEach((to, from, next) => {
  const isUserLoggedIn = !!currentUser.value;
  
  // Se a rota precisa de autenticação e o usuário não está logado
  if (to.name !== 'login' && !isUserLoggedIn) {
    next({ name: 'login' }); // Redireciona para a página de login
  }
  // Se o usuário está logado e tenta acessar a página de login
  else if (to.name === 'login' && isUserLoggedIn) {
    next({ name: 'dashboard' }); // Redireciona para o dashboard
  }
  // Em qualquer outro caso, permite a navegação
  else {
    next();
  }
});

export default router