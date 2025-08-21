<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-white">Gerenciamento de Trabalhadores</h1>
      </header>
      <main class="space-y-8">
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-slate-200 mb-5">Cadastrar Novo Trabalhador</h2>
          <form @submit.prevent="addWorker" class="space-y-4">
            <div>
              <label for="workerName" class="form-label">Nome Completo:</label>
              <input v-model="newWorker.name" type="text" id="workerName" class="form-input">
            </div>
            
            <div class="space-y-2">
              <label class="form-label">Registrado em Carteira?</label>
              <div class="flex items-center gap-x-6">
                <div class="flex items-center">
                  <input v-model="newWorker.isRegistered" :value="true" type="radio" id="registeredYes" name="isRegistered" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                  <label for="registeredYes" class="ml-2 block text-sm text-slate-300">Sim</label>
                </div>
                <div class="flex items-center">
                  <input v-model="newWorker.isRegistered" :value="false" type="radio" id="registeredNo" name="isRegistered" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                  <label for="registeredNo" class="ml-2 block text-sm text-slate-300">Não</label>
                </div>
              </div>
            </div>

            <div v-if="newWorker.isRegistered">
              <label for="registrationDate" class="form-label">Data do Registro:</label>
              <input v-model="newWorker.registrationDate" type="date" id="registrationDate" class="form-input">
            </div>
            <div v-if="newWorker.isRegistered">
              <label for="childrenCount" class="form-label">Número de Filhos:</label>
              <input v-model.number="newWorker.childrenCount" type="number" id="childrenCount" min="0" class="form-input">
            </div>
            
            <div class="flex items-center pt-2">
              <input v-model="newWorker.active" type="checkbox" id="workerActive" class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
              <label for="workerActive" class="ml-2 block text-sm text-slate-300">Trabalhador Ativo</label>
            </div>
            
            <div class="pt-2">
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-slate-200">Trabalhadores Cadastrados</h2>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Registro em Carteira</th>
                  <th>Filhos</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="worker in workers" :key="worker._id">
                  <td class="font-medium text-white">{{ worker.name }}</td>
                  <td>{{ worker.isRegistered ? 'Sim' : 'Não' }}</td>
                  <td>{{ worker.isRegistered ? worker.childrenCount : 'N/A' }}</td>
                  <td>
                    <span v-if="worker.active" class="px-2.5 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">Ativo</span>
                    <span v-else class="px-2.5 py-1 text-xs font-semibold text-white bg-slate-600 rounded-full">Inativo</span>
                  </td>
                  <td class="flex items-center gap-2">
                    <button @click="openEditModal(worker)" class="font-medium text-white bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-md text-xs transition-colors">Editar</button>
                    <button @click="deleteWorker(worker._id)" class="font-medium text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-md text-xs transition-colors">Excluir</button>
                  </td>
                </tr>
                <tr v-if="workers.length === 0">
                  <td colspan="5" class="text-center py-10 text-slate-500">Nenhum trabalhador cadastrado.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>

  <Modal :show="isModalOpen" @close="isModalOpen = false">
    <template #header>Editar Trabalhador</template>
    <template #body>
      <form @submit.prevent="updateWorker" class="space-y-4">
        <div>
          <label for="edit_workerName" class="form-label">Nome Completo:</label>
          <input v-model="editingWorker.name" type="text" id="edit_workerName" class="form-input">
        </div>
        <div class="space-y-2">
          <label class="form-label">Registrado em Carteira?</label>
          <div class="flex items-center gap-x-6">
            <div class="flex items-center">
              <input v-model="editingWorker.isRegistered" :value="true" type="radio" id="edit_registeredYes" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
              <label for="edit_registeredYes" class="ml-2 block text-sm text-slate-300">Sim</label>
            </div>
            <div class="flex items-center">
              <input v-model="editingWorker.isRegistered" :value="false" type="radio" id="edit_registeredNo" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
              <label for="edit_registeredNo" class="ml-2 block text-sm text-slate-300">Não</label>
            </div>
          </div>
        </div>
        
        <div v-if="editingWorker.isRegistered">
          <label for="edit_registrationDate" class="form-label">Data do Registro:</label>
          <input v-model="editingWorker.registrationDate" type="date" id="edit_registrationDate" class="form-input">
        </div>
        <div v-if="editingWorker.isRegistered">
          <label for="edit_childrenCount" class="form-label">Número de Filhos:</label>
          <input v-model.number="editingWorker.childrenCount" type="number" min="0" id="edit_childrenCount" class="form-input">
        </div>

        <div class="flex items-center pt-2">
          <input v-model="editingWorker.active" type="checkbox" id="edit_workerActive" class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
          <label for="edit_workerActive" class="ml-2 block text-sm text-slate-300">Trabalhador Ativo</label>
        </div>
      </form>
    </template>
    <template #footer>
      <button @click="isModalOpen = false" class="btn bg-slate-600 hover:bg-slate-500">Cancelar</button>
      <button @click="updateWorker" class="btn btn-primary">Salvar Alterações</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/api.js';
import Modal from '@/components/Modal.vue';

const workers = ref([]);
const newWorker = ref({
  name: '',
  isRegistered: true,
  registrationDate: '',
  childrenCount: 0,
  active: true,
});
const isModalOpen = ref(false);
const editingWorker = ref({});

// "Assiste" a variável newWorker.isRegistered. Se ela mudar para 'false',
// nós limpamos os campos relacionados para manter a consistência dos dados.
watch(() => newWorker.value.isRegistered, (isRegistered) => {
  if (!isRegistered) {
    newWorker.value.registrationDate = '';
    newWorker.value.childrenCount = 0;
  }
});

// Também assistimos o objeto de edição no modal
watch(() => editingWorker.value.isRegistered, (isRegistered) => {
  if (!isRegistered) {
    editingWorker.value.registrationDate = '';
    editingWorker.value.childrenCount = 0;
  }
});

// Função para formatar a data para o input type="date"
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

const fetchWorkers = async () => {
  try {
    const response = await api.get('/workers');
    workers.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar trabalhadores:', error);
  }
};

const addWorker = async () => {
  try {
    await api.post('/workers', newWorker.value);
    newWorker.value = { name: '', isRegistered: true, registrationDate: '', childrenCount: 0, active: true };
    await fetchWorkers();
  } catch (error) {
    console.error('Erro ao adicionar trabalhador:', error);
  }
};

const openEditModal = (worker) => {
  editingWorker.value = { 
    ...worker,
    registrationDate: formatDateForInput(worker.registrationDate)
  };
  isModalOpen.value = true;
};

const updateWorker = async () => {
  if (!editingWorker.value._id) return;
  try {
    await api.put(`/workers/${editingWorker.value._id}`, editingWorker.value);
    isModalOpen.value = false;
    await fetchWorkers();
  } catch (error) {
    console.error('Erro ao atualizar trabalhador:', error);
  }
};

const deleteWorker = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este trabalhador?')) return;
  try {
    await api.delete(`/workers/${id}`);
    await fetchWorkers();
  } catch (error) {
    console.error('Erro ao deletar trabalhador:', error);
  }
};

onMounted(fetchWorkers);
</script>