<template>
  <div class="min-h-screen bg-slate-900 font-sans text-slate-200">
    <header v-if="currentUser" class="border-b border-slate-700/50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="text-white text-xl font-bold tracking-wider cursor-default">
                SISTEMA DE GERENCIAMENTO
              </div>
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-2">
                <router-link to="/" class="nav-link">Dashboard</router-link>
                <router-link to="/servicos" class="nav-link">Serviços</router-link>
                <router-link to="/fazendas" class="nav-link">Fazendas</router-link>
                <router-link to="/trabalhadores" class="nav-link">Trabalhadores</router-link>
                <router-link to="/usuarios" class="nav-link">Usuários</router-link>
              </div>
            </div>
          </div>
          <div class="hidden md:block">
            <div class="ml-4 flex items-center md:ml-6">
              <span v-if="currentUser.name" class="text-sm text-slate-400 mr-4">Olá, {{ currentUser.name.split(' ')[0] }}</span>
              <button @click="handleLogout" class="bg-slate-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { currentUser, logout } from '@/data/store.js'

const router = useRouter();

const handleLogout = () => {
  logout();
  router.push({ name: 'login' });
};
</script>

<style scoped>
.nav-link {
  @apply text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors;
}
.router-link-exact-active {
  @apply bg-blue-600 text-white;
}
</style>