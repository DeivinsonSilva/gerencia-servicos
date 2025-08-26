<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-screen-xl mx-auto">
      <header class="mb-10 flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-400"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75-.75v-.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <h1 class="text-3xl font-bold text-white">Folha de Pagamento</h1>
      </header>

      <main class="space-y-8">
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-slate-200">Filtros e Ações</h2>
          <p class="text-slate-400 text-sm mt-1 mb-5">Selecione um grupo, defina o período e gere a folha de pagamento detalhada.</p>

          <div class="mb-6">
              <h3 class="form-label mb-2">1. Selecione o Tipo de Folha:</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button @click="setFilter('registrados')" :class="['report-card', { 'active': filters.workerType === 'registrados' }]">
                      <h3 class="font-semibold">Registrados</h3>
                      <p class="text-sm">Gera a folha para trabalhadores com registro.</p>
                  </button>
                  <button @click="setFilter('nao_registrados')" :class="['report-card', { 'active': filters.workerType === 'nao_registrados' }]">
                      <h3 class="font-semibold">Não Registrados</h3>
                      <p class="text-sm">Gera a folha para trabalhadores sem registro.</p>
                  </button>
                  <button @click="setFilter('semana_dentro')" :class="['report-card', { 'active': filters.workerType === 'semana_dentro' }]">
                      <h3 class="font-semibold">Semana Dentro</h3>
                      <p class="text-sm">Apenas diaristas com "semana dentro".</p>
                  </button>
              </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div>
              <label for="startDate" class="form-label">2. Data de Início:</label>
              <input v-model="filters.startDate" type="date" id="startDate" class="form-input">
            </div>
            <div>
              <label for="endDate" class="form-label">3. Data de Fim:</label>
              <input v-model="filters.endDate" type="date" id="endDate" class="form-input">
            </div>
            <div class="md:col-span-2 flex items-center gap-2 flex-wrap">
              <button @click="generatePayslip" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading">Gerando...</span>
                <span v-else>4. Gerar Folha</span>
              </button>
              <button @click="handlePdfExport" class="btn bg-red-700 hover:bg-red-600">Baixar PDF</button>
              <button @click="handleExcelExport" class="btn bg-green-700 hover:bg-green-600">Baixar Excel</button>
            </div>
          </div>
        </div>

        <div v-if="filters.workerType === 'registrados'" class="card p-6">
          <h2 class="text-xl font-semibold text-slate-200 mb-5">Configurações Adicionais para Registrados</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="inssRate" class="form-label">INSS (%):</label>
              <input v-model.number="config.inssRate" type="number" id="inssRate" class="form-input">
            </div>
            <div>
              <label for="salarioFamiliaValue" class="form-label">Salário Família (por filho):</label>
              <input v-model.number="config.salarioFamiliaValue" type="number" step="0.01" id="salarioFamiliaValue" class="form-input">
            </div>
          </div>
        </div>
        
        <div v-if="isLoading" class="text-center py-10">
            <p class="text-slate-400">Calculando folha de pagamento...</p>
        </div>

        <div v-if="!isLoading && payslipData.length > 0" class="card">
          <div class="p-6 border-b border-slate-700">
            <h2 class="text-xl font-semibold text-slate-200">Resultados da Folha de Pagamento</h2>
            <p class="text-sm text-slate-400">Período de {{ formatDate(filters.startDate) }} a {{ formatDate(filters.endDate) }}</p>
          </div>
          <div class="table-container">
            <table class="data-table text-xs whitespace-nowrap">
              <thead>
                <tr>
                  <th class="sticky left-0 bg-slate-900/50 z-10">Nomes</th>
                  <th v-for="day in dateHeaders" :key="day.fullDate" class="text-center">{{ day.dayOfWeek }}<br>{{ day.dayOfMonth }}</th>
                  <th>Salário Total</th>
                  <th v-if="filters.workerType === 'registrados'">INSS</th>
                  <th v-if="filters.workerType === 'registrados'">Sal. Família</th>
                  <th>Saldo</th>
                  <th>Desc. Eventual</th>
                  <th>Desc. Recorrente</th>
                  <th>Líquido a Receber</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in payslipData" :key="item.workerId">
                  <td class="sticky left-0 bg-slate-800 font-medium text-white">{{ item.workerName }}</td>
                  <td v-for="day in dateHeaders" :key="day.fullDate" class="text-center">
                    {{ item.dailyPayments[day.fullDate] ? formatCurrency(item.dailyPayments[day.fullDate]) : '-' }}
                  </td>
                  <td>{{ formatCurrency(item.grossPay) }}</td>
                  <td v-if="filters.workerType === 'registrados'" class="text-red-400">{{ formatCurrency(item.inssDeduction) }}</td>
                  <td v-if="filters.workerType === 'registrados'">{{ formatCurrency(item.salarioFamilia) }}</td>
                  
                  <td @click="editCell(item.workerId, 'saldo', $event)" class="cursor-pointer hover:bg-slate-700">
                    <input v-if="editingCell.id === item.workerId && editingCell.field === 'saldo'"
                           type="number" step="0.01" v-model="editingCell.value"
                           @blur="saveCell(index)" @keydown.enter.prevent="saveCell(index)"
                           class="w-20 bg-slate-600 text-white text-center rounded">
                    <span v-else>{{ formatCurrency(item.saldo) }}</span>
                  </td>
                  <td @click="editCell(item.workerId, 'desconto', $event)" class="cursor-pointer hover:bg-slate-700">
                    <input v-if="editingCell.id === item.workerId && editingCell.field === 'desconto'"
                           type="number" step="0.01" v-model="editingCell.value"
                           @blur="saveCell(index)" @keydown.enter.prevent="saveCell(index)"
                           class="w-20 bg-slate-600 text-white text-center rounded">
                    <span v-else class="text-red-400">{{ formatCurrency(item.desconto) }}</span>
                  </td>

                  <td class="text-red-400">{{ formatCurrency(item.recurringDiscount) }}</td>
                  <td class="text-green-400 font-bold text-sm">{{ formatCurrency(item.netPay) }}</td>
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
import { ref, computed, watch, nextTick } from 'vue';
import api from '@/api.js';
import { usePayslipExporter } from '@/composables/usePayslipExporter.js';
import { useToast } from 'vue-toastification';

const toast = useToast();
const { generatePDF, generateExcel } = usePayslipExporter();

const getMonthDateRange = () => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  return { firstDay, lastDay };
};

const filters = ref({
  workerType: 'registrados',
  startDate: getMonthDateRange().firstDay,
  endDate: getMonthDateRange().lastDay,
});

const config = ref({
  inssRate: 8,
  salarioFamiliaValue: 0,
});

const payslipData = ref([]);
const isLoading = ref(false);
const editingCell = ref({ id: null, field: null, value: 0 });
const groupLabels = {
    registrados: 'Folha de Pagamento - Registrados',
    nao_registrados: 'Folha de Pagamento - Não Registrados',
    semana_dentro: 'Folha de Pagamento - Semana Dentro',
};

const dateHeaders = computed(() => {
    const dates = [];
    if (!filters.value.startDate || !filters.value.endDate || payslipData.value.length === 0) return [];
    const start = new Date(filters.value.startDate + 'T00:00:00');
    const end = new Date(filters.value.endDate + 'T00:00:00');
    const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        dates.push({
            fullDate: new Date(dt).toISOString().slice(0, 10),
            dayOfWeek: daysOfWeek[dt.getDay()],
            dayOfMonth: dt.getDate().toString().padStart(2, '0'),
        });
    }
    return dates;
});

watch(payslipData, (newData) => {
    newData.forEach(item => {
        const grossPay = item.grossPay || 0;
        const salarioFamilia = item.salarioFamilia || 0;
        const saldo = item.saldo || 0;
        const inssDeduction = item.inssDeduction || 0;
        const recurringDiscount = item.recurringDiscount || 0;
        const desconto = item.desconto || 0;
        const totalAdditions = grossPay + salarioFamilia + saldo;
        const totalDeductions = inssDeduction + recurringDiscount + desconto;
        item.netPay = totalAdditions - totalDeductions;
    });
}, { deep: true });

const setFilter = (type) => {
    filters.value.workerType = type;
    payslipData.value = [];
};

const generatePayslip = async () => {
  if (!filters.value.startDate || !filters.value.endDate) {
    return toast.warning('Por favor, selecione a data de início e fim.');
  }
  isLoading.value = true;
  payslipData.value = [];
  try {
    const payload = { ...filters.value, ...config.value };
    const response = await api.post('/payroll/detailed', payload);
    payslipData.value = response.data.map(item => ({
        ...item,
        saldo: 0,
        desconto: 0,
    }));
    if (payslipData.value.length > 0) {
        toast.success('Folha de pagamento gerada com sucesso!');
    } else {
        toast.info('Nenhum registro encontrado para os filtros selecionados.');
    }
  } catch (error) {
    console.error("Erro ao gerar folha de pagamento:", error);
    toast.error(error.response?.data?.msg || "Não foi possível gerar a folha de pagamento.");
  } finally {
    isLoading.value = false;
  }
};

const handlePdfExport = () => {
    const dataToExport = { [filters.value.workerType]: payslipData.value };
    generatePDF(dataToExport, dateHeaders.value, filters.value, groupLabels);
};

const handleExcelExport = () => {
    const dataToExport = { [filters.value.workerType]: payslipData.value };
    generateExcel(dataToExport, dateHeaders.value, filters.value, groupLabels);
};

const editCell = (workerId, field, event) => {
    const workerData = payslipData.value.find(w => w.workerId === workerId);
    if (workerData) {
        editingCell.value = { id: workerId, field, value: workerData[field] || 0 };
        nextTick(() => { event.target.querySelector('input')?.focus(); });
    }
};

const saveCell = (index) => {
    if (editingCell.value.id !== null) {
        payslipData.value[index][editingCell.value.field] = Number(editingCell.value.value);
    }
    editingCell.value = { id: null, field: null, value: 0 };
};

const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};
</script>

<style scoped>
.report-card {
  @apply p-4 border border-slate-700 rounded-lg text-left text-center hover:bg-slate-700 transition-colors cursor-pointer;
}
.report-card p {
    @apply text-sm text-slate-400;
}
.report-card.active {
  @apply bg-blue-600 border-blue-500 text-white shadow-lg;
}
.report-card.active p {
    @apply text-blue-100;
}
</style>