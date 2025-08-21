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
            
            <div v-if="!newWorker.isRegistered" class="space-y-2">
              <label class="form-label">Semana Dentro?</label>
              <div class="flex items-center gap-x-6">
                 <div class="flex items-center">
                  <input v-model="newWorker.semanaDentro" :value="true" type="radio" id="semanaDentroYes" name="semanaDentro" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                  <label for="semanaDentroYes" class="ml-2 block text-sm text-slate-300">Sim</label>
                </div>
                <div class="flex items-center">
                  <input v-model="newWorker.semanaDentro" :value="false" type="radio" id="semanaDentroNo" name="semanaDentro" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                  <label for="semanaDentroNo" class="ml-2 block text-sm text-slate-300">Não</label>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="form-label">Desconto Recorrente?</label>
              <div class="flex items-center gap-x-6">
                <div class="flex items-center">
                  <input v-model="newWorker.hasRecurringDiscount" :value="true" type="radio" id="discountYes" name="hasRecurringDiscount" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                  <label for="discountYes" class="ml-2 block text-sm text-slate-300">Sim</label>
                </div>
                <div class="flex items-center">
                  <input v-model="newWorker.hasRecurringDiscount" :value="false" type="radio" id="discountNo" name="hasRecurringDiscount" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                  <label for="discountNo" class="ml-2 block text-sm text-slate-300">Não</label>
                </div>
              </div>
            </div>
            <div v-if="newWorker.hasRecurringDiscount">
              <label for="discountValue" class="form-label">Valor do Desconto (R$):</label>
              <input v-model.number="newWorker.recurringDiscountValue" type="number" id="discountValue" min="0" step="0.01" class="form-input" placeholder="0,00">
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
          
          <div class="flex flex-col">
            <div class="px-6 py-3 flex text-xs text-slate-400 uppercase bg-slate-900/50 border-t border-slate-700">
              <div class="w-1/2">Trabalhador</div>
              <div class="w-1/2 text-right">Ações</div>
            </div>

            <div v-if="workers.length > 0">
              <div v-for="worker in workers" :key="worker._id" class="px-6 py-4 flex flex-col md:flex-row md:items-center border-t border-slate-700 hover:bg-slate-700/50">
                <div class="w-full md:w-1/2 mb-4 md:mb-0">
                  <div class="flex items-center">
                    <p class="font-medium text-white">{{ worker.name }}</p>
                    <span v-if="worker.active" class="ml-3 px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Ativo</span>
                    <span v-else class="ml-3 px-2 py-0.5 text-xs font-semibold text-slate-800 bg-slate-300 rounded-full">Inativo</span>
                  </div>
                  <div class="flex items-center flex-wrap gap-2 mt-2">
                    <span class="tag" :class="worker.isRegistered ? 'tag-blue' : 'tag-gray'">
                      {{ worker.isRegistered ? 'Registrado' : 'Não Registrado' }}
                    </span>
                    <span v-if="!worker.isRegistered" class="tag" :class="worker.semanaDentro ? 'tag-cyan' : 'tag-gray'">
                      {{ worker.semanaDentro ? 'Semana Dentro' : 'Semana Fora' }}
                    </span>
                    <span v-if="worker.isRegistered && worker.childrenCount > 0" class="tag tag-purple">
                      {{ worker.childrenCount }} {{ worker.childrenCount > 1 ? 'Filhos' : 'Filho' }}
                    </span>
                    <span v-if="worker.hasRecurringDiscount" class="tag tag-yellow">
                      Desconto: {{ formatCurrency(worker.recurringDiscountValue) }}
                    </span>
                  </div>
                </div>
                <div class="w-full md:w-1/2 flex justify-start md:justify-end items-center gap-2">
                  <button @click="openEditModal(worker)" class="font-medium text-white bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-md text-xs transition-colors">Editar</button>
                  <button @click="deleteWorker(worker._id)" class="font-medium text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-md text-xs transition-colors">Excluir</button>
                </div>
              </div>
            </div>
            
            <div v-if="workers.length === 0" class="text-center py-10 text-slate-500 border-t border-slate-700">
              Nenhum trabalhador cadastrado.
            </div>
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
              <input v-model="editingWorker.isRegistered" :value="true" type="radio" id="edit_registeredYes" name="edit_isRegistered" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
              <label for="edit_registeredYes" class="ml-2 block text-sm text-slate-300">Sim</label>
            </div>
            <div class="flex items-center">
              <input v-model="editingWorker.isRegistered" :value="false" type="radio" id="edit_registeredNo" name="edit_isRegistered" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
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
        <div v-if="!editingWorker.isRegistered" class="space-y-2">
            <label class="form-label">Semana Dentro?</label>
            <div class="flex items-center gap-x-6">
                <div class="flex items-center">
                <input v-model="editingWorker.semanaDentro" :value="true" type="radio" id="edit_semanaDentroYes" name="edit_semanaDentro" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                <label for="edit_semanaDentroYes" class="ml-2 block text-sm text-slate-300">Sim</label>
                </div>
                <div class="flex items-center">
                <input v-model="editingWorker.semanaDentro" :value="false" type="radio" id="edit_semanaDentroNo" name="edit_semanaDentro" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                <label for="edit_semanaDentroNo" class="ml-2 block text-sm text-slate-300">Não</label>
                </div>
            </div>
        </div>
        <div class="space-y-2">
            <label class="form-label">Desconto Recorrente?</label>
            <div class="flex items-center gap-x-6">
                <div class="flex items-center">
                    <input v-model="editingWorker.hasRecurringDiscount" :value="true" type="radio" id="edit_discountYes" name="edit_hasRecurringDiscount" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                    <label for="edit_discountYes" class="ml-2 block text-sm text-slate-300">Sim</label>
                </div>
                <div class="flex items-center">
                    <input v-model="editingWorker.hasRecurringDiscount" :value="false" type="radio" id="edit_discountNo" name="edit_hasRecurringDiscount" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                    <label for="edit_discountNo" class="ml-2 block text-sm text-slate-300">Não</label>
                </div>
            </div>
        </div>
        <div v-if="editingWorker.hasRecurringDiscount">
            <label for="edit_discountValue" class="form-label">Valor do Desconto (R$):</label>
            <input v-model.number="editingWorker.recurringDiscountValue" type="number" id="edit_discountValue" min="0" step="0.01" class="form-input" placeholder="0,00">
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
  semanaDentro: false,
  hasRecurringDiscount: false,
  recurringDiscountValue: 0,
  active: true,
});
const isModalOpen = ref(false);
const editingWorker = ref({});

watch(() => newWorker.value.isRegistered, (isRegistered) => {
  if (!isRegistered) {
    newWorker.value.registrationDate = '';
    newWorker.value.childrenCount = 0;
  } else {
    newWorker.value.semanaDentro = false;
  }
});

watch(() => editingWorker.value.isRegistered, (isRegistered) => {
  if (!isRegistered) {
    editingWorker.value.registrationDate = '';
    editingWorker.value.childrenCount = 0;
  } else {
    editingWorker.value.semanaDentro = false;
  }
});

watch(() => newWorker.value.hasRecurringDiscount, (hasDiscount) => {
  if (!hasDiscount) {
    newWorker.value.recurringDiscountValue = 0;
  }
});

watch(() => editingWorker.value.hasRecurringDiscount, (hasDiscount) => {
  if (!hasDiscount) {
    editingWorker.value.recurringDiscountValue = 0;
  }
});

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

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
    newWorker.value = { name: '', isRegistered: true, registrationDate: '', childrenCount: 0, semanaDentro: false, hasRecurringDiscount: false, recurringDiscountValue: 0, active: true };
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

<style scoped>
/* Estilos para nossas novas tags */
.tag {
  @apply px-2 py-0.5 text-xs font-semibold rounded-full;
}
.tag-blue {
  @apply bg-blue-200 text-blue-800;
}
.tag-gray {
  @apply bg-slate-600 text-slate-200;
}
.tag-cyan {
  @apply bg-cyan-200 text-cyan-800;
}
.tag-purple {
  @apply bg-purple-200 text-purple-800;
}
.tag-yellow {
  @apply bg-yellow-200 text-yellow-800;
}
</style>