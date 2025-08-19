<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-white">Gerenciamento de Serviços</h1>
      </header>
      <main class="space-y-8">
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-slate-200 mb-5">Cadastrar Novo Serviço</h2>
          <form @submit.prevent="addService" class="space-y-4">
            <div>
              <label for="serviceName" class="form-label">Nome do Serviço:</label>
              <input v-model="newService.name" type="text" id="serviceName" class="form-input">
            </div>
            <div>
              <label for="servicePrice" class="form-label">Preço Padrão (R$):</label>
              <input v-model="newService.price" type="number" step="0.01" id="servicePrice" placeholder="0,00" class="form-input">
            </div>
            <div class="flex items-center pt-2">
              <input v-model="newService.active" type="checkbox" id="serviceActive" class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
              <label for="serviceActive" class="ml-2 block text-sm text-slate-300">Ativo</label>
            </div>
            <div class="pt-2">
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
        <div class="card">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-slate-200">Serviços Cadastrados</h2>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nome do Serviço</th>
                  <th>Preço Padrão</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="service in services" :key="service._id">
                  <td class="font-medium text-white">{{ service.name }}</td>
                  <td>{{ formatCurrency(service.price) }}</td>
                  <td>
                    <span v-if="service.active" class="px-2.5 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">Ativo</span>
                    <span v-else class="px-2.5 py-1 text-xs font-semibold text-white bg-slate-600 rounded-full">Inativo</span>
                  </td>
                  <td class="flex items-center gap-2">
                    <button class="font-medium text-white bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-md text-xs transition-colors">Editar</button>
                    <button @click="deleteService(service._id)" class="font-medium text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-md text-xs transition-colors">Excluir</button>
                  </td>
                </tr>
                <tr v-if="services.length === 0">
                  <td colspan="4" class="text-center py-10 text-slate-500">Nenhum serviço cadastrado.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Estado Local da Página
const services = ref([]);
const newService = ref({ name: '', price: null, active: true });

// URL da API
const API_URL = 'http://localhost:3000/api/services';

// --- Funções Auxiliares ---
const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const getAuthConfig = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { 'x-auth-token': token } };
};

// --- Lógica da API ---

// 1. Buscar todos os serviços
const fetchServices = async () => {
  try {
    const response = await axios.get(API_URL, getAuthConfig());
    services.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    alert('Não foi possível carregar os serviços. Verifique o console.');
  }
};

// 2. Adicionar um novo serviço
const addService = async () => {
  if (!newService.value.name || newService.value.price === null) {
    return alert('Por favor, preencha o nome e o preço.');
  }
  try {
    await axios.post(API_URL, newService.value, getAuthConfig());
    // Limpa o formulário
    newService.value = { name: '', price: null, active: true };
    // Recarrega a lista para mostrar o novo item
    await fetchServices();
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error);
    alert('Não foi possível adicionar o serviço.');
  }
};

// 3. Deletar um serviço
const deleteService = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthConfig());
    // Recarrega a lista para remover o item deletado
    await fetchServices();
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    alert('Não foi possível deletar o serviço.');
  }
};

// Roda a função de busca assim que o componente é montado na tela
onMounted(fetchServices);
</script>