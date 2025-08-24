// frontend/src/composables/useReports.js
import { ref, computed, watch } from 'vue';
import api from '@/api.js';

export function useReports() {
  // --- ESTADO REATIVO ---
  const filterType = ref('mensal');
  const dateFilter = ref(new Date().toISOString().slice(0, 7));
  const yearFilter = ref(new Date().getFullYear());
  const reportData = ref({ logs: null, total: 0, page: 1, pages: 1 });
  const farms = ref([]);
  const services = ref([]);
  const isModalOpen = ref(false);
  const editingLog = ref({});
  const activeWorkers = ref([]);
  const selectedWorkerIds = ref([]);
  const annualReportData = ref([]);
  const showWorkerSelection = ref(false);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // --- PROPRIEDADES COMPUTADAS ---
  const editingIsAbsent = computed({
    get: () => editingLog.value.status === 'Falta',
    set: (value) => {
      if (editingLog.value) {
        editingLog.value.status = value ? 'Falta' : 'Presente';
      }
    }
  });

  const filterLabel = computed(() => {
    if (filterType.value === 'diario') return 'Data:';
    if (filterType.value === 'mensal') return 'Mês/Ano:';
    return 'Ano:';
  });

  // --- WATCHERS ---
  watch(filterType, (newType) => {
    if (newType === 'diario') dateFilter.value = new Date().toISOString().slice(0, 10);
    else if (newType === 'mensal') dateFilter.value = new Date().toISOString().slice(0, 7);
  });

  watch(() => editingLog.value.service, (newServiceId) => {
    if (newServiceId && services.value.length > 0 && editingLog.value.status !== 'Falta') {
      const selectedService = services.value.find(s => s._id === newServiceId);
      if (selectedService) {
        editingLog.value.unitPrice = selectedService.price;
      }
    }
  });

  // --- FUNÇÕES ---
  const setReportType = async (type) => {
    filterType.value = type;
    reportData.value = { logs: null, total: 0, page: 1, pages: 1 };
    annualReportData.value = [];
    showWorkerSelection.value = false;

    if (type === 'anual') {
      showWorkerSelection.value = true;
      if (activeWorkers.value.length === 0) {
        await fetchActiveWorkers();
      }
    }
  };

  const fetchActiveWorkers = async () => {
    try {
      const response = await api.get('/workers');
      activeWorkers.value = response.data.filter(w => w.active);
    } catch (error) {
      console.error("Erro ao buscar trabalhadores ativos:", error);
    }
  };

  const generateLogReport = async (page = 1) => {
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
      annualReportData.value = [];
    } catch (error) { console.error("Erro ao gerar relatório:", error); }
  };

  const generateAnnualReport = async () => {
    if (selectedWorkerIds.value.length === 0) return alert('Por favor, selecione pelo menos um trabalhador.');
    try {
      const response = await api.get('/reports/annual', {
        params: { year: yearFilter.value, workerIds: selectedWorkerIds.value.join(',') }
      });
      annualReportData.value = response.data;
      reportData.value = { logs: null, total: 0, page: 1, pages: 1 };
    } catch (error) { console.error("Erro ao gerar relatório anual:", error); }
  };

  const getDaysForMonth = (workerReport, monthNum) => {
    const monthData = workerReport.monthlyData.find(m => m.month === monthNum);
    return monthData ? monthData.days : 0;
  };

  const goToPage = (page) => { generateLogReport(page); };

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
        farm: editingLog.value.farm, service: editingLog.value.service,
        status: editingLog.value.status,
        production: editingLog.value.status === 'Falta' ? 0 : editingLog.value.production,
        unitPrice: editingLog.value.unitPrice,
      };
      await api.put(`/worklogs/${editingLog.value._id}`, payload);
      isModalOpen.value = false;
      await generateLogReport(reportData.value.page);
    } catch (error) { console.error("Erro ao atualizar registro:", error); }
  };

  const deleteWorkLog = async (id) => {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;
    try {
      await api.delete(`/worklogs/${id}`);
      await generateLogReport(reportData.value.page);
    } catch (error) { console.error("Erro ao deletar registro:", error); }
  };

  const fetchDropdownData = async () => {
    try {
      const [farmsRes, servicesRes] = await Promise.all([
        api.get('/farms'), api.get('/services')
      ]);
      farms.value = farmsRes.data;
      services.value = servicesRes.data;
    } catch (error) {
      console.error("Erro ao buscar dados para os menus:", error);
    }
  };

  const formatCurrency = (value) => {
      if (typeof value !== 'number') return 'R$ 0,00';
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Expõe todas as variáveis e funções que o componente da página irá precisar
  return {
    filterType, dateFilter, yearFilter, reportData, farms, services, isModalOpen,
    editingLog, activeWorkers, selectedWorkerIds, annualReportData, showWorkerSelection,
    months, editingIsAbsent, filterLabel,
    setReportType, fetchActiveWorkers, generateLogReport, generateAnnualReport,
    getDaysForMonth, goToPage, openEditModal, updateWorkLog, deleteWorkLog,
    fetchDropdownData, formatCurrency
  };
}