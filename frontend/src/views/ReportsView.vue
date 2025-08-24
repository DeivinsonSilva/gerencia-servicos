<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-10 flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-400"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1.5-1.5m1.5 1.5l1.5-1.5m0 0l1.5 1.5m-1.5-1.5l-1.5 1.5m-7.5 2.25h7.5m-7.5 0l-1.5-1.5m1.5 1.5l1.5-1.5m0 0l1.5 1.5m-1.5-1.5l-1.5 1.5" /></svg>
        <h1 class="text-3xl font-bold text-white">Relatórios de Atividades Diárias</h1>
      </header>

      <main class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button @click="setReportType('diario')" :class="['report-card', { 'active': filterType === 'diario' }]">
            <h3 class="font-semibold">Relatório Diário</h3>
            <p class="text-sm text-slate-400">Lista de atividades de um dia específico.</p>
          </button>
          <button @click="setReportType('mensal')" :class="['report-card', { 'active': filterType === 'mensal' }]">
            <h3 class="font-semibold">Relatório Mensal</h3>
            <p class="text-sm text-slate-400">Lista de atividades de um mês completo.</p>
          </button>
          <button @click="setReportType('anual')" :class="['report-card', { 'active': filterType === 'anual' }]">
            <h3 class="font-semibold">Relatório Anual</h3>
            <p class="text-sm text-slate-400">Sumário de dias trabalhados por trabalhador.</p>
          </button>
        </div>

        <div class="card p-6">
          <div v-if="filterType === 'diario' || filterType === 'mensal'" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label for="dateFilter" class="form-label">{{ filterLabel }}</label>
              <input v-model="dateFilter" :type="filterType === 'diario' ? 'date' : 'month'" class="form-input">
            </div>
            <div class="md:col-span-3 flex items-center gap-2 flex-wrap">
              <button @click="generateLogReport(1)" class="btn btn-primary">Gerar Relatório</button>
              <button @click="handlePdfExport" class="btn bg-red-700 hover:bg-red-600">Baixar PDF</button>
              <button @click="handleExcelExport" class="btn bg-green-700 hover:bg-green-600">Baixar Excel</button>
            </div>
          </div>
          <div v-if="filterType === 'anual'" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
             <div>
              <label for="yearFilter" class="form-label">{{ filterLabel }}</label>
              <input v-model="yearFilter" type="number" placeholder="Ex: 2025" class="form-input">
            </div>
            <div class="md:col-span-3 flex items-center gap-2 flex-wrap">
              <button @click="generateAnnualReport" class="btn btn-primary">Gerar Relatório Anual</button>
              <button @click="handlePdfExport" class="btn bg-red-700 hover:bg-red-600">Baixar PDF</button>
              <button @click="handleExcelExport" class="btn bg-green-700 hover:bg-green-600">Baixar Excel</button>
            </div>
          </div>
        </div>

        <div v-if="showWorkerSelection" class="card p-6">
            <h2 class="text-xl font-semibold text-slate-200 mb-4">Selecione os Trabalhadores para o Relatório</h2>
            <div class="border border-slate-700 rounded-lg max-h-64 overflow-y-auto">
                <div v-for="worker in activeWorkers" :key="worker._id" class="flex items-center p-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50">
                    <input type="checkbox" :id="worker._id" :value="worker._id" v-model="selectedWorkerIds" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <label :for="worker._id" class="ml-3 text-slate-300 w-full cursor-pointer">{{ worker.name }}</label>
                </div>
            </div>
        </div>

        <div class="card">
          <div v-if="filterType === 'diario' || filterType === 'mensal'">
            <div class="p-6 border-b border-slate-700">
                <h2 class="text-xl font-semibold text-slate-200">Resultados</h2>
                <p v-if="reportData.total > 0" class="text-sm text-slate-400 mt-1">
                Mostrando {{ reportData.logs.length }} de {{ reportData.total }} registros.
                </p>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead><tr><th>Data</th><th>Trabalhador</th><th>Status</th><th>Fazenda</th><th>Serviço/Motivo</th><th>Produção</th><th>Preço Unit.</th><th>Total</th><th>Ações</th></tr></thead>
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
                    <td colspan="9" class="text-center py-10 text-slate-500">Nenhum resultado encontrado.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="p-4 border-t border-slate-700" v-if="reportData.pages > 1">
                <Pagination :currentPage="reportData.page" :totalPages="reportData.pages" @page-changed="goToPage" />
            </div>
          </div>

          <div v-if="filterType === 'anual' && annualReportData.length > 0">
            <div class="p-6"><h2 class="text-xl font-semibold text-slate-200">Resultados - Relatório Anual {{ yearFilter }}</h2></div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>Trabalhador</th><th v-for="month in months" :key="month" class="text-center">{{ month }}</th><th class="text-center">Total Dias</th></tr></thead>
                    <tbody>
                        <tr v-for="workerReport in annualReportData" :key="workerReport.workerId">
                            <td class="font-medium text-white">{{ workerReport.workerName }}</td>
                            <td v-for="monthNum in 12" :key="monthNum" class="text-center">{{ getDaysForMonth(workerReport, monthNum) }}</td>
                            <td class="text-center font-bold text-lg">{{ workerReport.totalDays }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <Modal :show="isModalOpen" @close="isModalOpen = false">
      <template #header>Editar Lançamento</template>
        <template #body>
          <form v-if="editingLog._id" @submit.prevent="updateWorkLog" class="space-y-4">
            <div><label class="form-label">Trabalhador:</label><p class="font-semibold text-white mt-1">{{ editingLog.workerName }}</p></div>
            <div class="flex items-center">
              <input v-model="editingIsAbsent" type="checkbox" id="edit_markAbsent" class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500">
              <label for="edit_markAbsent" class="ml-2 block text-sm text-slate-300">Marcar como Falta</label>
            </div>
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
        <button @click="updateWorkLog" class="btn btn-primary">Salvar Alterações</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useReports } from '@/composables/useReports.js';
import { useReportExporter } from '@/composables/useReportExporter.js';
import Pagination from '@/components/Pagination.vue';
import Modal from '@/components/Modal.vue';
import api from '@/api.js'; // <-- CORREÇÃO: Importa o 'api' aqui

const {
  filterType, dateFilter, yearFilter, reportData, farms, services, isModalOpen,
  editingLog, activeWorkers, selectedWorkerIds, annualReportData, showWorkerSelection,
  months, editingIsAbsent, filterLabel,
  setReportType, generateLogReport, generateAnnualReport,
  getDaysForMonth, goToPage, openEditModal, updateWorkLog, deleteWorkLog,
  fetchDropdownData, formatCurrency
} = useReports();

const { downloadLogReportPDF, downloadLogReportExcel, downloadAnnualReportPDF, downloadAnnualReportExcel } = useReportExporter();

const handlePdfExport = async () => {
  if (filterType.value === 'anual') {
    downloadAnnualReportPDF(annualReportData.value, yearFilter.value);
  } else {
    const { logs } = await fetchAllLogData();
    downloadLogReportPDF(logs, dateFilter.value);
  }
};

const handleExcelExport = async () => {
  if (filterType.value === 'anual') {
    downloadAnnualReportExcel(annualReportData.value, yearFilter.value);
  } else {
    const { logs } = await fetchAllLogData();
    downloadLogReportExcel(logs, dateFilter.value);
  }
};

const fetchAllLogData = async () => {
  const params = { limit: 0 };
   if (filterType.value === 'diario') {
      if (!dateFilter.value) { alert('Por favor, selecione uma data.'); return { logs: [] }; }
      params.date = dateFilter.value;
    } else {
      if (!dateFilter.value) { alert('Por favor, selecione um mês.'); return { logs: [] }; }
      params.month = dateFilter.value;
    }
  // CORREÇÃO: Usa a instância 'api' importada
  const response = await api.get('/worklogs', { params });
  return response.data;
};

onMounted(() => {
  fetchDropdownData();
  generateLogReport();
});
</script>

<style scoped>
.report-card {
  @apply p-4 border border-slate-700 rounded-lg text-left hover:bg-slate-700 transition-colors cursor-pointer;
}
.report-card.active {
  @apply bg-blue-600 border-blue-500 text-white shadow-lg;
}
</style>