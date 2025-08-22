<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-12">
        <h1 class="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
        <p class="mt-2 text-lg text-slate-400">Bem-vindo ao seu painel de gerenciamento.</p>
      </header>
      <main>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          <router-link to="/registro-diario" class="shortcut-card">
            <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" /></svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-white">Registro Diário</h3>
            <p class="mt-1 text-sm text-slate-400">Lance as atividades e a produção diária dos trabalhadores.</p>
          </router-link>

          <router-link to="/servicos" class="shortcut-card">
            <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0A2.25 2.25 0 016.637 8.25l.857 6m-1.882 0L5.25 8.25m14.5 0l2.408 1.526a2.25 2.25 0 01.358 3.164l-6 8A2.25 2.25 0 0116.5 21.75H7.5a2.25 2.25 0 01-2.122-2.818l6-8A2.25 2.25 0 0111.946 9.75l2.408-1.526z" /></svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-white">Gerenciar Serviços</h3>
            <p class="mt-1 text-sm text-slate-400">Cadastre, edite e visualize os serviços prestados.</p>
          </router-link>
          
          <router-link to="/fazendas" class="shortcut-card">
            <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-green-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
            </div>
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
            <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-amber-500 text-white">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 12A3.375 3.375 0 1012 5.25 3.375 3.375 0 0012 12z" /></svg>
            </div>
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
const workerCount = ref(0);
const userCount = ref(0);

onMounted(async () => {
  try {
    const [servicesRes, farmsRes, workersRes, usersRes] = await Promise.all([
      api.get('/services'),
      api.get('/farms'),
      api.get('/workers'),
      api.get('/users')
    ]);
    serviceCount.value = servicesRes.data.length;
    farmCount.value = farmsRes.data.length;
    workerCount.value = workersRes.data.length;
    userCount.value = usersRes.data.length;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      userCount.value = '-';
      try {
        const [servicesRes, farmsRes, workersRes] = await Promise.all([
          api.get('/services'),
          api.get('/farms'),
          api.get('/workers')
        ]);
        serviceCount.value = servicesRes.data.length;
        farmCount.value = farmsRes.data.length;
        workerCount.value = workersRes.data.length;
      } catch (e) { console.error('Erro ao buscar dados do dashboard (operador):', e); }
    } else { console.error('Erro ao buscar dados do dashboard:', error); }
  }
});
</script>

<style scoped>
.shortcut-card {
  @apply block p-6 bg-slate-800 border border-slate-700 rounded-lg shadow-lg hover:bg-slate-700 hover:border-blue-500 transition-all duration-200 cursor-pointer;
}
</style>