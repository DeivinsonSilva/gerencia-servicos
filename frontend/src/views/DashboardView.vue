<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-12">
        <h1 class="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
        <p class="mt-2 text-lg text-slate-400">Bem-vindo ao seu painel de gerenciamento.</p>
      </header>
      <main>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <router-link to="/servicos" class="shortcut-card">
            <h3 class="mt-4 text-lg font-semibold text-white">Gerenciar Serviços</h3>
            <p class="mt-1 text-sm text-slate-400">Cadastre, edite e visualize os serviços prestados.</p>
          </router-link>
          <router-link to="/fazendas" class="shortcut-card">
            <h3 class="mt-4 text-lg font-semibold text-white">Gerenciar Fazendas</h3>
            <p class="mt-1 text-sm text-slate-400">Adicione novas fazendas e gerencie seus proprietários.</p>
          </router-link>
          <router-link to="/trabalhadores" class="shortcut-card">
            <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-teal-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.963A3.001 3.001 0 004.5 12.75a3 3 0 00-4.682-2.72m7.5-2.963a9.094 9.094 0 013.741-.479 3 3 0 014.682 2.72m-7.5 2.963V7.5a3 3 0 016 0v4.275m-6 0a3 3 0 00-6 0v4.275a3 3 0 006 0v-4.275z" /></svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-white">Gerenciar Trabalhadores</h3>
            <p class="mt-1 text-sm text-slate-400">Adicione e mantenha o registro dos seus trabalhadores.</p>
          </router-link>
          <router-link to="/usuarios" class="shortcut-card">
            <h3 class="mt-4 text-lg font-semibold text-white">Gerenciar Usuários</h3>
            <p class="mt-1 text-sm text-slate-400">Controle o acesso ao sistema criando usuários e permissões.</p>
          </router-link>
        </div>
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-slate-200 mb-5">Estatísticas Gerais</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div class="bg-slate-900/50 p-4 rounded-lg">
              <p class="text-sm text-slate-400">Serviços</p>
              <p class="text-3xl font-bold text-white mt-1">{{ serviceCount }}</p>
            </div>
            <div class="bg-slate-900/50 p-4 rounded-lg">
              <p class="text-sm text-slate-400">Fazendas</p>
              <p class="text-3xl font-bold text-white mt-1">{{ farmCount }}</p>
            </div>
            <div class="bg-slate-900/50 p-4 rounded-lg">
              <p class="text-sm text-slate-400">Trabalhadores</p>
              <p class="text-3xl font-bold text-white mt-1">{{ workerCount }}</p>
            </div>
            <div class="bg-slate-900/50 p-4 rounded-lg">
              <p class="text-sm text-slate-400">Usuários</p>
              <p class="text-3xl font-bold text-white mt-1">{{ userCount }}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '@/api.js';

const serviceCount = ref(0);
const farmCount = ref(0);
const workerCount = ref(0); // <-- NOVA VARIÁVEL
const userCount = ref(0);

onMounted(async () => {
  try {
    const [servicesRes, farmsRes, workersRes, usersRes] = await Promise.all([ // <-- NOVA CHAMADA
      api.get('/services'),
      api.get('/farms'),
      api.get('/workers'), // <-- NOVA CHAMADA
      api.get('/users')
    ]);
    serviceCount.value = servicesRes.data.length;
    farmCount.value = farmsRes.data.length;
    workerCount.value = workersRes.data.length; // <-- NOVO VALOR
    userCount.value = usersRes.data.length;
  } catch (error) {
    // ... (lógica de erro existente) ...
  }
});
</script>

<style scoped>
.shortcut-card {
  @apply block p-6 bg-slate-800 border border-slate-700 rounded-lg shadow-lg hover:bg-slate-700 hover:border-blue-500 transition-all duration-200 cursor-pointer;
}
</style>