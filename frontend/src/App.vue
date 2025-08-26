<template>
  <div class="min-h-screen bg-slate-900 font-sans text-slate-200 flex flex-col">
    <header v-if="currentUser" class="border-b border-slate-700/50 sticky top-0 bg-slate-900 z-20">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo/Título Principal -->
          <div class="flex-shrink-0">
            <div class="text-white text-xl font-bold tracking-wider cursor-default">
              SISTEMA DE GERENCIAMENTO
            </div>
          </div>

          <!-- Menu Desktop (Escondido em telas pequenas) -->
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-2">
              <router-link to="/" class="nav-link">Dashboard</router-link>
              <router-link to="/registro-diario" class="nav-link">Registro Diário</router-link>
              
              <div class="relative">
                <button @click="toggleMenu('financeiro')" class="nav-link flex items-center">
                  Financeiro <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div v-if="openMenu === 'financeiro'" @mouseleave="openMenu = null" class="absolute z-10 mt-2 w-48 bg-slate-800 rounded-md shadow-lg border border-slate-700">
                  <router-link to="/relatorios" class="dropdown-link" @click="closeAllMenus">Relatórios</router-link>
                  <router-link to="/folha-pagamento" class="dropdown-link" @click="closeAllMenus">Folha de Pagamento</router-link>
                </div>
              </div>

              <div class="relative">
                <button @click="toggleMenu('cadastros')" class="nav-link flex items-center">
                  Cadastros <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div v-if="openMenu === 'cadastros'" @mouseleave="openMenu = null" class="absolute z-10 mt-2 w-56 bg-slate-800 rounded-md shadow-lg border border-slate-700">
                  <router-link to="/servicos" class="dropdown-link" @click="closeAllMenus">Gerenciar Serviços</router-link>
                  <router-link to="/fazendas" class="dropdown-link" @click="closeAllMenus">Gerenciar Fazendas</router-link>
                  <router-link to="/trabalhadores" class="dropdown-link" @click="closeAllMenus">Gerenciar Trabalhadores</router-link>
                </div>
              </div>

              <div class="relative" v-if="isAdmin">
                <button @click="toggleMenu('admin')" class="nav-link flex items-center">
                  Admin <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                 <div v-if="openMenu === 'admin'" @mouseleave="openMenu = null" class="absolute z-10 mt-2 w-56 bg-slate-800 rounded-md shadow-lg border border-slate-700">
                  <router-link to="/usuarios" class="dropdown-link" @click="closeAllMenus">Gerenciar Usuários</router-link>
                  <router-link to="/admin" class="dropdown-link" @click="closeAllMenus">Dashboard do Sistema</router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Menu do Usuário (Desktop) -->
          <div class="hidden md:block">
            <div class="ml-4 flex items-center md:ml-6">
              <div class="relative">
                <button @click="toggleMenu('user')" class="flex items-center text-sm text-slate-300 hover:text-white transition">
                  <span v-if="currentUser.name">Olá, {{ currentUser.name.split(' ')[0] }}</span>
                  <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div v-if="openMenu === 'user'" @mouseleave="openMenu = null" class="absolute right-0 z-10 mt-2 w-48 bg-slate-800 rounded-md shadow-lg border border-slate-700">
                  <router-link to="/meu-perfil" class="dropdown-link" @click="closeAllMenus">Meu Perfil</router-link>
                  <button @click="handleLogout" class="dropdown-link">Sair</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Botão Hambúrguer (Aparece apenas em telas pequenas) -->
          <div class="-mr-2 flex md:hidden">
            <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:bg-slate-700 focus:text-white">
              <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <!-- Menu Mobile -->
      <div v-if="isMobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <router-link to="/" class="mobile-link" @click="closeAllMenus">Dashboard</router-link>
          <router-link to="/registro-diario" class="mobile-link" @click="closeAllMenus">Registro Diário</router-link>
          <router-link to="/relatorios" class="mobile-link" @click="closeAllMenus">Relatórios</router-link>
          <router-link to="/folha-pagamento" class="mobile-link" @click="closeAllMenus">Folha de Pagamento</router-link>
          <router-link to="/servicos" class="mobile-link" @click="closeAllMenus">Gerenciar Serviços</router-link>
          <router-link to="/fazendas" class="mobile-link" @click="closeAllMenus">Gerenciar Fazendas</router-link>
          <router-link to="/trabalhadores" class="mobile-link" @click="closeAllMenus">Gerenciar Trabalhadores</router-link>
          <div v-if="isAdmin" class="border-t border-slate-700 pt-2 mt-2">
            <router-link to="/usuarios" class="mobile-link" @click="closeAllMenus">Gerenciar Usuários</router-link>
            <router-link to="/admin" class="mobile-link" @click="closeAllMenus">Dashboard do Sistema</router-link>
          </div>
        </div>
        <div class="pt-4 pb-3 border-t border-slate-700">
          <div class="flex items-center px-5">
            <div class="ml-3">
              <div class="text-base font-medium leading-none text-white">{{ currentUser.name }}</div>
            </div>
          </div>
          <div class="mt-3 px-2 space-y-1">
            <router-link to="/meu-perfil" class="mobile-link" @click="closeAllMenus">Meu Perfil</router-link>
            <button @click="handleLogout" class="mobile-link">Sair</button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- O conteúdo principal agora cresce para preencher o espaço -->
    <main class="flex-grow">
      <router-view />
    </main>

    <!-- NOSSO NOVO RODAPÉ -->
    <Footer v-if="currentUser" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { currentUser, logout } from '@/data/store.js';
import Footer from '@/components/Footer.vue'; // <-- 1. IMPORTA O COMPONENTE

const router = useRouter();
const openMenu = ref(null); 
const isMobileMenuOpen = ref(false);

const isAdmin = computed(() => currentUser.value && currentUser.value.role === 'Admin');

const toggleMenu = (menu) => {
  openMenu.value = openMenu.value === menu ? null : menu;
};

const closeAllMenus = () => {
  openMenu.value = null;
  isMobileMenuOpen.value = false;
};

const handleLogout = () => {
  closeAllMenus();
  logout();
  router.push({ name: 'login' });
};
</script>

<style scoped>
.nav-link {
  @apply text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer;
}
.router-link-exact-active {
  @apply bg-blue-600 text-white;
}
.dropdown-link {
  @apply block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white w-full text-left;
}
.dropdown-link.router-link-exact-active {
    @apply bg-blue-600;
}
.mobile-link {
    @apply block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 w-full text-left;
}
.mobile-link.router-link-exact-active {
    @apply bg-slate-700 text-white;
}
</style>
