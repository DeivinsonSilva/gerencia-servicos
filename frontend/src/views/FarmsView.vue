<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-white">Gerenciamento de Fazendas</h1>
      </header>
      <main class="space-y-8">
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-slate-200 mb-5">Cadastrar Nova Fazenda</h2>
          <form @submit.prevent="addFarm" class="space-y-4">
            <div>
              <label for="farmName" class="form-label">Nome da Fazenda:</label>
              <input v-model="newFarm.name" type="text" id="farmName" class="form-input">
            </div>
            <div>
              <label for="farmOwner" class="form-label">Proprietário:</label>
              <input v-model="newFarm.owner" type="text" id="farmOwner" class="form-input">
            </div>
            <div>
              <label for="farmCity" class="form-label">Cidade:</label>
              <input v-model="newFarm.city" type="text" id="farmCity" class="form-input">
            </div>
            <div class="flex items-center pt-2">
              <input v-model="newFarm.active" type="checkbox" id="farmActive" class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
              <label for="farmActive" class="ml-2 block text-sm text-slate-300">Ativa</label>
            </div>
            <div class="pt-2">
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
        <div class="card">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-slate-200">Fazendas Cadastradas</h2>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Proprietário</th>
                  <th>Cidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="farm in farms" :key="farm._id">
                  <td class="font-medium text-white">{{ farm.name }}</td>
                  <td>{{ farm.owner }}</td>
                  <td>{{ farm.city }}</td>
                  <td>
                    <span v-if="farm.active" class="px-2.5 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">Ativa</span>
                    <span v-else class="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">Inativa</span>
                  </td>
                  <td class="flex items-center gap-2">
                    <button @click="openEditModal(farm)" class="font-medium text-white bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-md text-xs transition-colors">Editar</button>
                    <button @click="deleteFarm(farm._id)" class="font-medium text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-md text-xs transition-colors">Excluir</button>
                  </td>
                </tr>
                <tr v-if="farms.length === 0">
                  <td colspan="5" class="text-center py-10 text-slate-500">Nenhuma fazenda cadastrada.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>

  <Modal :show="isModalOpen" @close="isModalOpen = false">
    <template #header>Editar Fazenda</template>
    <template #body>
      <form @submit.prevent="updateFarm" class="space-y-4">
        <div>
          <label for="editFarmName" class="form-label">Nome da Fazenda:</label>
          <input v-model="editingFarm.name" type="text" id="editFarmName" class="form-input">
        </div>
        <div>
          <label for="editFarmOwner" class="form-label">Proprietário:</label>
          <input v-model="editingFarm.owner" type="text" id="editFarmOwner" class="form-input">
        </div>
        <div>
          <label for="editFarmCity" class="form-label">Cidade:</label>
          <input v-model="editingFarm.city" type="text" id="editFarmCity" class="form-input">
        </div>
        <div class="flex items-center pt-2">
          <input v-model="editingFarm.active" type="checkbox" id="editFarmActive" class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
          <label for="editFarmActive" class="ml-2 block text-sm text-slate-300">Ativa</label>
        </div>
      </form>
    </template>
    <template #footer>
      <button @click="isModalOpen = false" class="btn bg-slate-600 hover:bg-slate-500">Cancelar</button>
      <button @click="updateFarm" class="btn btn-primary">Salvar Alterações</button>
    </template>
  </Modal>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api.js'; // Importamos nossa nova instância do axios
import Modal from '@/components/Modal.vue';

const farms = ref([]);
const newFarm = ref({ name: '', owner: '', city: '', active: true });
const isModalOpen = ref(false);
const editingFarm = ref({ _id: null, name: '', owner: '', city: '', active: true });

const fetchFarms = async () => {
  try {
    const response = await api.get('/farms'); // Usamos 'api' e o caminho relativo
    farms.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar fazendas:', error);
    alert('Não foi possível carregar as fazendas.');
  }
};

const addFarm = async () => {
  if (!newFarm.value.name || !newFarm.value.owner || !newFarm.value.city) {
    return alert('Por favor, preencha todos os campos.');
  }
  try {
    await api.post('/farms', newFarm.value);
    newFarm.value = { name: '', owner: '', city: '', active: true };
    await fetchFarms();
  } catch (error) {
    console.error('Erro ao adicionar fazenda:', error);
    alert('Não foi possível adicionar a fazenda.');
  }
};

const openEditModal = (farm) => {
  editingFarm.value = { ...farm };
  isModalOpen.value = true;
};

const updateFarm = async () => {
  if (!editingFarm.value._id) return;
  try {
    await api.put(`/farms/${editingFarm.value._id}`, editingFarm.value);
    isModalOpen.value = false;
    await fetchFarms();
  } catch (error) {
    console.error('Erro ao atualizar fazenda:', error);
    alert('Não foi possível atualizar a fazenda.');
  }
};

const deleteFarm = async (id) => {
  if (!confirm('Tem certeza que deseja excluir esta fazenda?')) return;
  try {
    await api.delete(`/farms/${id}`);
    await fetchFarms();
  } catch (error) {
    console.error('Erro ao deletar fazenda:', error);
    alert('Não foi possível deletar a fazenda.');
  }
};

onMounted(fetchFarms);
</script>