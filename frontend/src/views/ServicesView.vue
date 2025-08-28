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
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading">Salvando...</span>
                <span v-else>Salvar</span>
              </button>
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
                    <button @click="openEditModal(service)" class="font-medium text-white bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-md text-xs transition-colors">Editar</button>
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

  <Modal :show="isModalOpen" @close="isModalOpen = false">
    <template #header>Editar Serviço</template>
    <template #body>
      <form @submit.prevent="updateService" class="space-y-4">
        <div>
          <label for="editServiceName" class="form-label">Nome do Serviço:</label>
          <input v-model="editingService.name" type="text" id="editServiceName" class="form-input">
        </div>
        <div>
          <label for="editServicePrice" class="form-label">Preço Padrão (R$):</label>
          <input v-model="editingService.price" type="number" step="0.01" id="editServicePrice" class="form-input">
        </div>
        <div class="flex items-center pt-2">
          <input v-model="editingService.active" type="checkbox" id="editServiceActive" class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
          <label for="editServiceActive" class="ml-2 block text-sm text-slate-300">Ativo</label>
        </div>
      </form>
    </template>
    <template #footer>
      <button @click="isModalOpen = false" class="btn bg-slate-600 hover:bg-slate-500">Cancelar</button>
      <button @click="updateService" class="btn btn-primary" :disabled="isLoading">
        <span v-if="isLoading">Salvando...</span>
        <span v-else>Salvar Alterações</span>
      </button>
    </template>
  </Modal>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api.js';
import Modal from '@/components/Modal.vue';
import { useToast } from 'vue-toastification'; // <-- IMPORTA O TOAST

const toast = useToast(); // <-- INICIA O TOAST isso é importante
const services = ref([]);
const newService = ref({ name: '', price: null, active: true });
const isModalOpen = ref(false);
const editingService = ref({ _id: null, name: '', price: null, active: true });
const isLoading = ref(false); // <-- VARIÁVEL PARA O FEEDBACK DE CARREGAMENTO

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const fetchServices = async () => {
  try {
    const response = await api.get('/services');
    services.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    toast.error('Não foi possível carregar os serviços.');
  }
};

const addService = async () => {
  isLoading.value = true;
  try {
    await api.post('/services', newService.value);
    toast.success('Serviço adicionado com sucesso!');
    newService.value = { name: '', price: null, active: true };
    await fetchServices();
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error);
    const errorMsg = error.response?.data?.errors?.[0]?.msg || 'Não foi possível adicionar o serviço.';
    toast.error(errorMsg);
  } finally {
    isLoading.value = false;
  }
};

const openEditModal = (service) => {
  editingService.value = { ...service };
  isModalOpen.value = true;
};

const updateService = async () => {
  if (!editingService.value._id) return;
  isLoading.value = true;
  try {
    await api.put(`/services/${editingService.value._id}`, editingService.value);
    toast.success('Serviço atualizado com sucesso!');
    isModalOpen.value = false;
    await fetchServices();
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    const errorMsg = error.response?.data?.errors?.[0]?.msg || 'Não foi possível atualizar o serviço.';
    toast.error(errorMsg);
  } finally {
    isLoading.value = false;
  }
};

const deleteService = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
  try {
    await api.delete(`/services/${id}`);
    toast.success('Serviço removido com sucesso!');
    await fetchServices();
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    toast.error('Não foi possível deletar o serviço.');
  }
};

onMounted(fetchServices);
</script>