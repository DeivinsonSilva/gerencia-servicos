<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-10 flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-400"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1.5-1.5m1.5 1.5l1.5-1.5m0 0l1.5 1.5m-1.5-1.5l-1.5 1.5m-7.5 2.25h7.5m-7.5 0l-1.5-1.5m1.5 1.5l1.5-1.5m0 0l1.5 1.5m-1.5-1.5l-1.5 1.5" /></svg>
        <h1 class="text-3xl font-bold text-white">Relatórios de Atividades Diárias</h1>
      </header>

      <main class="space-y-8">
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-slate-200 mb-5">Filtros e Ações</h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div class="md:col-span-1">
              <label class="form-label">Tipo de Filtro:</label>
              <div class="flex items-center gap-x-6 mt-2">
                <div class="flex items-center">
                  <input v-model="filterType" value="diario" type="radio" id="filterDaily" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                  <label for="filterDaily" class="ml-2 block text-sm text-slate-300">Diário</label>
                </div>
                <div class="flex items-center">
                  <input v-model="filterType" value="mensal" type="radio" id="filterMonthly" class="h-4 w-4 border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
                  <label for="filterMonthly" class="ml-2 block text-sm text-slate-300">Mensal</label>
                </div>
              </div>
            </div>

            <div class="md:col-span-1">
              <label for="dateFilter" class="form-label">{{ filterType === 'diario' ? 'Data:' : 'Mês/Ano:' }}</label>
              <input v-model="dateFilter" :type="filterType === 'diario' ? 'date' : 'month'" id="dateFilter" class="form-input">
            </div>

            <div class="md:col-span-3 flex items-center gap-2">
              <button @click="generateReport(1)" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading">Gerando...</span>
                <span v-else>Gerar Relatório</span>
              </button>
              <button @click="downloadPDF" class="btn bg-red-700 hover:bg-red-600">Baixar PDF Completo</button>
              <button @click="downloadExcel" class="btn bg-green-700 hover:bg-green-600">Baixar Excel</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="p-6 border-b border-slate-700">
            <h2 class="text-xl font-semibold text-slate-200">Resultados</h2>
            <p v-if="reportData.total > 0" class="text-sm text-slate-400 mt-1">
              Mostrando {{ reportData.logs.length }} de {{ reportData.total }} registros.
            </p>
          </div>
          <div class="table-container">
            <table class="data-table">
               <thead>
                <tr>
                  <th>Data</th>
                  <th>Trabalhador</th>
                  <th>Status</th>
                  <th>Fazenda</th>
                  <th>Serviço/Motivo</th>
                  <th>Produção</th>
                  <th>Preço Unit.</th>
                  <th>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="9" class="text-center py-10 text-slate-400">Carregando dados...</td>
                </tr>
                <tr v-if="!isLoading && reportData.logs" v-for="log in reportData.logs" :key="log._id">
                  <td>{{ new Date(log.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) }}</td>
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
                <tr v-if="!isLoading && reportData.logs && reportData.logs.length === 0">
                  <td colspan="9" class="text-center py-10 text-slate-500">Nenhum resultado encontrado para os filtros selecionados.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="p-4 border-t border-slate-700" v-if="!isLoading && reportData.pages > 1">
            <Pagination :currentPage="reportData.page" :totalPages="reportData.pages" @page-changed="goToPage" />
          </div>
        </div>
      </main>
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
        <button @click="updateWorkLog" class="btn btn-primary" :disabled="isLoadingModal">
          <span v-if="isLoadingModal">Salvando...</span>
          <span v-else>Salvar Alterações</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/api.js';
import Pagination from '@/components/Pagination.vue';
import Modal from '@/components/Modal.vue';
import { useToast } from 'vue-toastification';
import { useReportExporter } from '@/composables/useReportExporter.js';

const toast = useToast();
const { downloadLogReportPDF, downloadLogReportExcel } = useReportExporter();

const filterType = ref('mensal');
const dateFilter = ref(new Date().toISOString().slice(0, 7));
const reportData = ref({ logs: null, total: 0, page: 1, pages: 1 });
const farms = ref([]);
const services = ref([]);
const isModalOpen = ref(false);
const editingLog = ref({});
const isLoading = ref(false);
const isLoadingModal = ref(false);

const editingIsAbsent = computed({
  get: () => editingLog.value.status === 'Falta',
  set: (value) => {
    if (editingLog.value) {
      editingLog.value.status = value ? 'Falta' : 'Presente';
    }
  }
});

watch(() => editingLog.value.service, (newServiceId) => {
  if (newServiceId && services.value.length > 0 && editingLog.value.status !== 'Falta') {
    const selectedService = services.value.find(s => s._id === newServiceId);
    if (selectedService) editingLog.value.unitPrice = selectedService.price;
  }
});

const generateReport = async (page = 1) => {
  isLoading.value = true;
  try {
    const params = { page, limit: 10 };
    if (filterType.value === 'diario') {
      if (!dateFilter.value) { toast.warning('Por favor, selecione uma data.'); return; }
      params.date = dateFilter.value;
    } else {
      if (!dateFilter.value) { toast.warning('Por favor, selecione um mês.'); return; }
      params.month = dateFilter.value;
    }
    const response = await api.get('/worklogs', { params });
    reportData.value = response.data;
  } catch (error) {
    toast.error("Não foi possível gerar o relatório.");
  } finally {
    isLoading.value = false;
  }
};

const goToPage = (page) => { generateReport(page); };

const downloadPDF = async () => {
  const params = { limit: 0 };
  let filterValue = '';
  if (filterType.value === 'diario') {
    if (!dateFilter.value) { return toast.warning('Selecione uma data para exportar.'); }
    params.date = dateFilter.value; filterValue = dateFilter.value;
  } else {
    if (!dateFilter.value) { return toast.warning('Selecione um mês para exportar.'); }
    params.month = dateFilter.value; filterValue = dateFilter.value;
  }
  try {
    toast.info("Gerando PDF, por favor aguarde...");
    const response = await api.get('/worklogs', { params });
    downloadLogReportPDF(response.data.logs, filterValue);
  } catch (error) {
    toast.error("Falha ao buscar dados para o PDF.");
  }
};

const downloadExcel = async () => {
  const params = { limit: 0 };
  let filterValue = '';
  if (filterType.value === 'diario') {
    if (!dateFilter.value) { return toast.warning('Selecione uma data para exportar.'); }
    params.date = dateFilter.value; filterValue = dateFilter.value;
  } else {
    if (!dateFilter.value) { return toast.warning('Selecione um mês para exportar.'); }
    params.month = dateFilter.value; filterValue = dateFilter.value;
  }
  try {
    toast.info("Gerando Excel, por favor aguarde...");
    const response = await api.get('/worklogs', { params });
    downloadLogReportExcel(response.data.logs, filterValue);
  } catch (error) {
    toast.error("Falha ao buscar dados para o Excel.");
  }
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

const updateWorkLog = async () => {
  if (!editingLog.value._id) return;
  isLoadingModal.value = true;
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
    await generateReport(reportData.value.page);
  } catch (error) {
    toast.error('Não foi possível atualizar o registro.');
  } finally {
    isLoadingModal.value = false;
  }
};

const deleteWorkLog = async (id) => {
  if (!confirm('Tem certeza que deseja remover este registro?')) return;
  try {
    await api.delete(`/worklogs/${id}`);
    toast.success('Registro removido com sucesso!');
    await generateReport(reportData.value.page);
  } catch (error) {
    toast.error('Não foi possível remover o registro.');
  }
};

const fetchDropdownData = async () => {
  try {
    const [farmsRes, servicesRes] = await Promise.all([api.get('/farms'), api.get('/services')]);
    farms.value = farmsRes.data;
    services.value = servicesRes.data;
  } catch(error) {
    toast.error("Não foi possível carregar dados para os menus de edição.");
  }
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

onMounted(() => {
    fetchDropdownData();
    generateReport();
});
</script>