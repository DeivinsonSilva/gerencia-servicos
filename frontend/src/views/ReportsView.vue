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
              <button @click="generateReport(1)" class="btn btn-primary">Gerar Relatório</button>
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
                <tr v-for="log in reportData.logs" :key="log._id">
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
                <tr v-if="reportData.logs && reportData.logs.length === 0">
                  <td colspan="9" class="text-center py-10 text-slate-500">Nenhum resultado encontrado para os filtros selecionados.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="p-4 border-t border-slate-700" v-if="reportData.pages > 1">
            <Pagination :currentPage="reportData.page" :totalPages="reportData.pages" @page-changed="goToPage" />
          </div>
        </div>
      </main>

      <Modal :show="isModalOpen" @close="isModalOpen = false">
        <template #header>Editar Lançamento</template>
        <template #body>
          <form v-if="editingLog._id" @submit.prevent="updateWorkLog" class="space-y-4">
            <div>
              <label class="form-label">Trabalhador:</label>
              <p class="font-semibold text-white mt-1">{{ editingLog.workerName }}</p>
            </div>
            <div class="flex items-center">
              <input v-model="editingIsAbsent" type="checkbox" id="edit_markAbsent" class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
              <label for="edit_markAbsent" class="ml-2 block text-sm text-slate-300">Marcar como Falta</label>
            </div>
            <div v-if="!editingIsAbsent" class="space-y-4">
              <div>
                <label for="edit_farmSelect" class="form-label">Fazenda:</label>
                <select v-model="editingLog.farm" id="edit_farmSelect" class="form-select">
                  <option v-for="farm in farms" :key="farm._id" :value="farm._id">{{ farm.name }}</option>
                </select>
              </div>
              <div>
                <label for="edit_serviceSelect" class="form-label">Serviço:</label>
                <select v-model="editingLog.service" id="edit_serviceSelect" class="form-select">
                  <option v-for="service in services" :key="service._id" :value="service._id">{{ service.name }}</option>
                </select>
              </div>
              <div>
                <label for="edit_production" class="form-label">Produção:</label>
                <input v-model.number="editingLog.production" type="number" id="edit_production" class="form-input">
              </div>
              <div>
                <label for="edit_unitPrice" class="form-label">Preço (R$):</label>
                <input v-model.number="editingLog.unitPrice" type="number" step="0.01" id="edit_unitPrice" class="form-input">
              </div>
            </div>
          </form>
        </template>
        <template #footer>
          <button @click="isModalOpen = false" class="btn bg-slate-600 hover:bg-slate-500">Cancelar</button>
          <button @click="updateWorkLog" class="btn btn-primary">Salvar Alterações</button>
        </template>
      </Modal>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api.js';
import Pagination from '@/components/Pagination.vue';
import Modal from '@/components/Modal.vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const filterType = ref('mensal');
const dateFilter = ref(new Date().toISOString().slice(0, 7));
const reportData = ref({ logs: [], total: 0, page: 1, pages: 1 });
const farms = ref([]);
const services = ref([]);
const isModalOpen = ref(false);
const editingLog = ref({});

const editingIsAbsent = computed({
  get: () => editingLog.value.status === 'Falta',
  set: (value) => {
    if (editingLog.value) {
      editingLog.value.status = value ? 'Falta' : 'Presente';
    }
  }
});

const generateReport = async (page = 1) => {
  try {
    const params = { page, limit: 10 };
    if (filterType.value === 'diario') {
      if (!dateFilter.value) return alert('Por favor, selecione uma data.');
      params.date = dateFilter.value;
    } else {
      if (!dateFilter.value) return alert('Por favor, selecione um mês.');
      params.month = dateFilter.value;
    }
    const response = await api.get('/worklogs', { params });
    reportData.value = response.data;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
  }
};

const goToPage = (page) => {
  generateReport(page);
};

const downloadPDF = async () => {
  try {
    const params = { limit: 0 };
    if (filterType.value === 'diario') {
      if (!dateFilter.value) return alert('Por favor, selecione uma data.');
      params.date = dateFilter.value;
    } else {
      if (!dateFilter.value) return alert('Por favor, selecione um mês.');
      params.month = dateFilter.value;
    }
    const response = await api.get('/worklogs', { params });
    const allLogs = response.data.logs;

    if (allLogs.length === 0) {
      return alert('Não há dados para exportar com os filtros selecionados.');
    }

    const doc = new jsPDF();
    doc.text(`Relatório de Atividades - ${dateFilter.value}`, 14, 15);

    const tableColumn = ["Data", "Trabalhador", "Status", "Fazenda", "Serviço", "Prod.", "Total"];
    const tableRows = [];

    allLogs.forEach(log => {
      const logData = [
        new Date(log.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        log.worker.name,
        log.status,
        log.farm?.name || 'N/A',
        log.service?.name || 'N/A',
        log.status === 'Presente' ? log.production : 'N/A',
        formatCurrency(log.totalPay)
      ];
      tableRows.push(logData);
    });

    const generationDate = new Date().toLocaleString('pt-BR');
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      didDrawPage: function (data) {
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Relatório gerado em: ${generationDate}`, data.settings.margin.left, pageHeight - 10);
      },
    });

    doc.save(`relatorio_${dateFilter.value}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("Não foi possível gerar o PDF.");
  }
};

const downloadExcel = async () => {
  try {
    const params = { limit: 0 };
    if (filterType.value === 'diario') {
      if (!dateFilter.value) return alert('Por favor, selecione uma data.');
      params.date = dateFilter.value;
    } else {
      if (!dateFilter.value) return alert('Por favor, selecione um mês.');
      params.month = dateFilter.value;
    }
    const response = await api.get('/worklogs', { params });
    const allLogs = response.data.logs;

    if (allLogs.length === 0) {
      return alert('Não há dados para exportar com os filtros selecionados.');
    }

    const dataToExport = allLogs.map(log => ({
      'Data': new Date(log.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
      'Trabalhador': log.worker.name,
      'Status': log.status,
      'Fazenda': log.farm?.name || 'N/A',
      'Serviço': log.service?.name || 'N/A',
      'Produção': log.status === 'Presente' ? log.production : 'N/A',
      'Preço Unit.': log.status === 'Presente' ? log.unitPrice : 'N/A',
      'Pagamento Total': log.totalPay
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
    XLSX.writeFile(workbook, `relatorio_${dateFilter.value}.xlsx`);
  } catch (error) {
    console.error("Erro ao gerar Excel:", error);
    alert("Não foi possível gerar o arquivo Excel.");
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
  try {
    const payload = {
      farm: editingLog.value.farm,
      service: editingLog.value.service,
      status: editingLog.value.status,
      production: editingLog.value.status === 'Falta' ? 0 : editingLog.value.production,
      unitPrice: editingLog.value.unitPrice,
    };
    await api.put(`/worklogs/${editingLog.value._id}`, payload);
    isModalOpen.value = false;
    await generateReport(reportData.value.page); 
  } catch (error) {
    console.error("Erro ao atualizar registro:", error);
  }
};

const deleteWorkLog = async (id) => {
  if (!confirm('Tem certeza que deseja remover este registro?')) return;
  try {
    await api.delete(`/worklogs/${id}`);
    await generateReport(reportData.value.page);
  } catch (error) {
    console.error("Erro ao deletar registro:", error);
  }
};

const fetchDropdownData = async () => {
    try {
        const [farmsRes, servicesRes] = await Promise.all([
            api.get('/farms'),
            api.get('/services')
        ]);
        farms.value = farmsRes.data;
        services.value = servicesRes.data;
    } catch(error) {
        console.error("Erro ao buscar dados para os menus:", error);
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