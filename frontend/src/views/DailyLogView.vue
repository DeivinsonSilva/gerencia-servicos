<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-white">Registro de Trabalho Diário</h1>
      </header>

      <main class="space-y-8">
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-slate-200 mb-4">1. Selecione a Data do Registro</h2>
          <input v-model="selectedDate" @change="fetchWorkLogs" type="date" required
                 class="form-input max-w-sm date-input">
        </div>

        <div v-if="selectedDate" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1">
            <div class="card">
              <div class="p-6">
                <h2 class="text-xl font-semibold text-slate-200">Trabalhadores Disponíveis</h2>
              </div>
              <ul class="max-h-96 overflow-y-auto">
                <li v-for="worker in availableWorkers" :key="worker._id">
                  <button @click="selectWorkerForNewLog(worker)" class="w-full text-left px-6 py-3 border-t border-slate-700 text-slate-300 hover:bg-slate-700/50 transition-colors">
                    {{ worker.name }}
                  </button>
                </li>
                <li v-if="workers.length === 0" class="px-6 py-4 border-t border-slate-700 text-slate-500">
                  Nenhum trabalhador cadastrado.
                </li>
                 <li v-if="workers.length > 0 && availableWorkers.length === 0" class="px-6 py-4 border-t border-slate-700 text-slate-500">
                  Todos os trabalhadores já foram lançados.
                </li>
              </ul>
            </div>
          </div>

          <div class="lg:col-span-2">
            <div class="card p-6">
              <h2 class="text-xl font-semibold text-slate-200 mb-4">2. Lançar Atividade</h2>
              <form @submit.prevent="addWorkLog" class="space-y-4">
                <div>
                  <label for="workerSelect" class="form-label">Trabalhador:</label>
                  <select v-model="newLog.worker" id="workerSelect" class="form-select">
                    <option disabled value="">Selecione...</option>
                    <option v-for="worker in availableWorkers" :key="worker._id" :value="worker._id">
                      {{ worker.name }}
                    </option>
                  </select>
                </div>

                <div class="flex items-center">
                  <input v-model="isAbsent" type="checkbox" id="markAbsent" class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                  <label for="markAbsent" class="ml-2 block text-sm text-slate-300">Marcar como Falta</label>
                </div>

                <div v-if="!isAbsent" class="space-y-4">
                  <div>
                    <label for="farmSelect" class="form-label">Fazenda:</label>
                    <select v-model="newLog.farm" id="farmSelect" class="form-select">
                      <option disabled value="">Selecione...</option>
                      <option v-for="farm in farms" :key="farm._id" :value="farm._id">{{ farm.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label for="serviceSelect" class="form-label">Serviço:</label>
                    <select v-model="newLog.service" @change="updatePrice" id="serviceSelect" class="form-select">
                      <option disabled value="">Selecione...</option>
                      <option v-for="service in services" :key="service._id" :value="service._id">{{ service.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label for="production" class="form-label">Produção:</label>
                    <input v-model.number="newLog.production" type="number" id="production" class="form-input">
                  </div>
                  <div>
                    <label for="unitPrice" class="form-label">Preço (R$):</label>
                    <input v-model.number="newLog.unitPrice" type="number" step="0.01" id="unitPrice" class="form-input">
                  </div>
                </div>

                <div class="pt-2">
                  <button type="submit" class="w-full btn btn-primary" :disabled="isLoading">
                    <span v-if="isLoading">Adicionando...</span>
                    <span v-else>Adicionar à Lista</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div v-if="selectedDate" class="card">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-slate-200">3. Resumo do Dia</h2>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>Trabalhador</th><th>Status</th><th>Fazenda</th><th>Serviço/Motivo</th><th>Produção</th><th>Preço Unit.</th><th>Total</th><th>Ações</th></tr></thead>
              <tbody>
                <tr v-for="log in workLogs" :key="log._id">
                  <td class="font-medium text-white">{{ log.worker.name }}</td>
                  <td><span :class="log.status === 'Presente' ? 'text-green-400' : 'text-red-400'">{{ log.status }}</span></td>
                  <td>{{ log.farm?.name || 'N/A' }}</td>
                  <td>{{ log.service?.name || 'N/A' }}</td>
                  <td>{{ log.status === 'Presente' ? log.production : 'N/A' }}</td>
                  <td>{{ log.status === 'Presente' ? formatCurrency(log.unitPrice) : 'N/A' }}</td>
                  <td>{{ formatCurrency(log.totalPay) }}</td>
                  <td class="flex items-center gap-2">
                    <button @click="openEditModal(log)" class="font-medium text-white bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-md text-xs transition-colors">Editar</button>
                    <button @click="deleteWorkLog(log._id)" class="font-medium text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-md text-xs transition-colors">Remover</button>
                  </td>
                </tr>
                <tr v-if="workLogs.length === 0"><td colspan="8" class="text-center py-10 text-slate-500">Nenhum registro para esta data.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>

  <Modal :show="isModalOpen" @close="isModalOpen = false">
    <template #header>Editar Lançamento</template>
    <template #body>
      <form v-if="editingLog._id" @submit.prevent="updateWorkLog" class="space-y-4">
        <div><label class="form-label">Trabalhador:</label><p class="font-semibold text-white mt-1">{{ editingLog.workerName }}</p></div>
        <div class="flex items-center"><input v-model="editingIsAbsent" type="checkbox" id="edit_markAbsent" class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"><label for="edit_markAbsent" class="ml-2 block text-sm text-slate-300">Marcar como Falta</label></div>
        <div v-if="!editingIsAbsent" class="space-y-4">
          <div><label for="edit_farmSelect" class="form-label">Fazenda:</label><select v-model="editingLog.farm" id="edit_farmSelect" class="form-select"><option v-for="farm in farms" :key="farm._id" :value="farm._id">{{ farm.name }}</option></select></div>
          <div><label for="edit_serviceSelect" class="form-label">Serviço:</label><select v-model="editingLog.service" id="edit_serviceSelect" class="form-select"><option v-for="service in services" :key="service._id" :value="service._id">{{ service.name }}</option></select></div>
          <div><label for="edit_production" class="form-label">Produção:</label><input v-model.number="editingLog.production" type="number" id="edit_production" class="form-input"></div>
          <div><label for="edit_unitPrice" class="form-label">Preço (R$):</label><input v-model.number="editingLog.unitPrice" type="number" step="0.01" id="edit_unitPrice" class="form-input"></div>
        </div>
      </form>
    </template>
    <template #footer>
      <button @click="isModalOpen = false" class="btn bg-slate-600 hover:bg-slate-500">Cancelar</button>
      <button @click="updateWorkLog" class="btn btn-primary" :disabled="isLoading">
        <span v-if="isLoading">Salvando...</span>
        <span v-else>Salvar Alterações</span>
      </button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/api.js';
import Modal from '@/components/Modal.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();
const workers = ref([]);
const farms = ref([]);
const services = ref([]);
const workLogs = ref([]);
const selectedDate = ref('');
const isAbsent = ref(false);
const newLog = ref({ worker: '', farm: '', service: '', status: 'Presente', production: 0, unitPrice: 0 });
const isModalOpen = ref(false);
const editingLog = ref({});
const isLoading = ref(false);

const editingIsAbsent = computed({
  get: () => editingLog.value.status === 'Falta',
  set: (value) => {
    if (editingLog.value) {
      editingLog.value.status = value ? 'Falta' : 'Presente';
    }
  }
});

watch(isAbsent, (isMarkedAsAbsent) => {
  if (isMarkedAsAbsent) {
    newLog.value.farm = ''; newLog.value.service = '';
    newLog.value.production = 0; newLog.value.unitPrice = 0;
  }
});

watch(() => editingLog.value.service, (newServiceId) => {
  if (newServiceId && services.value.length > 0 && editingLog.value.status !== 'Falta') {
    const selectedService = services.value.find(s => s._id === newServiceId);
    if (selectedService) editingLog.value.unitPrice = selectedService.price;
  }
});

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const fetchInitialData = async () => {
  try {
    const [workersRes, farmsRes, servicesRes] = await Promise.all([
      api.get('/workers?onlyActive=true'),
      api.get('/farms?onlyActive=true'),
      api.get('/services?onlyActive=true')
    ]);
    workers.value = workersRes.data;
    farms.value = farmsRes.data;
    services.value = servicesRes.data;
  } catch (error) {
    toast.error("Não foi possível carregar os dados de cadastros.");
  }
};

const fetchWorkLogs = async () => {
  if (!selectedDate.value) { workLogs.value = []; return; }
  isLoading.value = true;
  try {
    // 👇 ALTERAÇÃO AQUI: Adicionado o parâmetro `&fetchAll=true`
    const response = await api.get(`/worklogs?date=${selectedDate.value}&fetchAll=true`);
    workLogs.value = response.data.logs;
  } catch (error) {
    toast.error(`Não foi possível buscar os registros para esta data.`);
  } finally {
    isLoading.value = false;
  }
};

const addWorkLog = async () => {
  if (!newLog.value.worker) return toast.warning('Por favor, selecione um trabalhador.');
  const isAbsentValue = isAbsent.value;
  if (!isAbsentValue && (!newLog.value.farm || !newLog.value.service)) {
    return toast.warning('Por favor, selecione a fazenda e o serviço.');
  }
  
  isLoading.value = true;
  try {
    const logData = {
      date: selectedDate.value,
      worker: newLog.value.worker,
      status: isAbsentValue ? 'Falta' : 'Presente',
    };
    if (!isAbsentValue) {
      logData.farm = newLog.value.farm; logData.service = newLog.value.service;
      logData.production = newLog.value.production; logData.unitPrice = newLog.value.unitPrice;
    }
    await api.post('/worklogs', logData);
    toast.success('Registro adicionado com sucesso!');
    newLog.value = { worker: '', farm: '', service: '', status: 'Presente', production: 0, unitPrice: 0 };
    isAbsent.value = false;
    await fetchWorkLogs();
  } catch (error) {
    toast.error(error.response?.data?.msg || 'Não foi possível adicionar o registro.');
  } finally {
    isLoading.value = false;
  }
};

const updateWorkLog = async () => {
  if (!editingLog.value._id) return;
  isLoading.value = true;
  try {
    const payload = {
      farm: editingLog.value.farm, service: editingLog.value.service,
      status: editingLog.value.status,
      production: editingLog.value.status === 'Falta' ? 0 : editingLog.value.production,
      unitPrice: editingLog.value.unitPrice,
    };
    await api.put(`/worklogs/${editingLog.value._id}`, payload);
    toast.success('Registro atualizado com sucesso!');
    isModalOpen.value = false;
    await fetchWorkLogs();
  } catch (error) {
    toast.error('Não foi possível atualizar o registro.');
  } finally {
    isLoading.value = false;
  }
};

const deleteWorkLog = async (id) => {
  if (!confirm('Tem certeza que deseja remover este registro?')) return;
  isLoading.value = true;
  try {
    await api.delete(`/worklogs/${id}`);
    toast.success('Registro removido com sucesso!');
    await fetchWorkLogs();
  } catch (error) {
    toast.error('Não foi possível remover o registro.');
  } finally {
    isLoading.value = false;
  }
};

const updatePrice = () => {
  const selectedService = services.value.find(s => s._id === newLog.value.service);
  if (selectedService) {
    newLog.value.unitPrice = selectedService.price;
  }
};

const selectWorkerForNewLog = (worker) => {
  newLog.value.worker = worker._id;
  document.getElementById('farmSelect')?.focus();
};

const openEditModal = (log) => {
  editingLog.value = {
    _id: log._id,
    workerName: log.worker.name,
    farm: log.farm ? log.farm._id : '',
    service: log.service ? log.service._id : '',
    status: log.status,
    production: log.production,
    unitPrice: log.unitPrice,
  };
  isModalOpen.value = true;
};

const availableWorkers = computed(() => {
  const loggedWorkerIds = workLogs.value.map(log => log.worker._id);
  return workers.value.filter(worker => !loggedWorkerIds.includes(worker._id));
});

onMounted(fetchInitialData);
</script>

<style scoped>
.date-input:invalid::before {
  content: 'Selecione a data';
  color: #9ca3af;
}
</style>