<template>
  <div class="p-4 sm:p-6 md:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold text-white mb-6">Gestão de Sugestões</h1>

      <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Adicionar Nova Sugestão</h2>
        <form @submit.prevent="submitSuggestion">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-300 mb-1">Título</label>
              <input
                v-model="newSuggestion.title"
                type="text"
                id="title"
                required
                class="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Melhorar relatório anual"
              />
            </div>

            <div>
              <label for="type" class="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
              <select
                v-model="newSuggestion.type"
                id="type"
                class="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option>Melhoria</option>
                <option>Correção</option>
              </select>
            </div>
          </div>

          <div class="mt-6">
            <label for="description" class="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
            <textarea
              v-model="newSuggestion.description"
              id="description"
              rows="4"
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descreva sua sugestão ou o erro encontrado em detalhes."
            ></textarea>
          </div>

          <div class="mt-6 text-right">
            <button
              type="submit"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
            >
              Enviar Sugestão
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-white mb-4">Sugestões Enviadas</h2>
        <div v-if="suggestions.length === 0" class="bg-gray-800 p-6 rounded-lg shadow-lg text-center text-gray-400">
          Nenhuma sugestão encontrada.
        </div>
        <div v-else class="space-y-4">
          <div v-for="suggestion in suggestions" :key="suggestion._id" class="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-bold text-lg text-white">{{ suggestion.title }}</h3>
                <p class="text-sm text-gray-400 mt-1 break-words">{{ suggestion.description }}</p>
              </div>
              <div class="text-right flex-shrink-0 ml-4">
                <span :class="getTypeClass(suggestion.type)" class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full">
                  {{ suggestion.type }}
                </span>
                <span :class="getStatusClass(suggestion.status)" class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full mt-2">
                  {{ suggestion.status }}
                </span>
              </div>
            </div>
            <div class="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
              <span>Enviado por: {{ suggestion.createdBy?.name || 'Usuário Deletado' }} | Em: {{ formatDate(suggestion.createdAt) }}</span>
              
              <div class="flex items-center space-x-4">
                <label class="flex items-center cursor-pointer">
                    <input type="checkbox" :checked="suggestion.status === 'Concluído'" @change="toggleStatus(suggestion)" class="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-indigo-600 focus:ring-indigo-500">
                    <span class="ml-2 text-gray-400">Resolvido</span>
                </label>
                <button @click="openEditModal(suggestion)" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-1 px-3 rounded text-xs">Editar</button>
                <button @click="handleDelete(suggestion._id)" class="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Modal :show="isModalOpen" @close="closeModal">
        <template #header>Editar Sugestão</template>
        <template #body>
          <form v-if="currentSuggestion" @submit.prevent="handleUpdate">
            <div>
              <label for="edit-title" class="block text-sm font-medium text-gray-300 mb-1">Título</label>
              <input v-model="currentSuggestion.title" type="text" id="edit-title" required class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white">
            </div>
            <div class="mt-4">
              <label for="edit-type" class="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
              <select v-model="currentSuggestion.type" id="edit-type" class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white">
                <option>Melhoria</option>
                <option>Correção</option>
              </select>
            </div>
            <div class="mt-4">
              <label for="edit-status" class="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select v-model="currentSuggestion.status" id="edit-status" class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white">
                <option>Pendente</option>
                <option>Em Análise</option>
                <option>Concluído</option>
              </select>
            </div>
            <div class="mt-4">
              <label for="edit-description" class="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
              <textarea v-model="currentSuggestion.description" id="edit-description" rows="4" required class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"></textarea>
            </div>
          </form>
        </template>
        <template #footer>
          <button @click="closeModal" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">Cancelar</button>
          <button @click="handleUpdate" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Salvar Alterações</button>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api';
import { useToast } from 'vue-toastification';
import Modal from '@/components/Modal.vue';

const toast = useToast();
const suggestions = ref([]);
const newSuggestion = ref({
  title: '',
  description: '',
  type: 'Melhoria',
});

const isModalOpen = ref(false);
const currentSuggestion = ref(null);

const fetchSuggestions = async () => {
  try {
    const response = await apiClient.get('/suggestions');
    suggestions.value = response.data.data;
  } catch (error) {
    toast.error('Erro ao buscar sugestões.');
    console.error(error);
  }
};

const submitSuggestion = async () => {
  try {
    await apiClient.post('/suggestions', newSuggestion.value);
    toast.success('Sugestão enviada com sucesso!');
    newSuggestion.value = { title: '', description: '', type: 'Melhoria' };
    await fetchSuggestions();
  } catch (error) {
    toast.error(error.response?.data?.error || 'Erro ao enviar sugestão.');
    console.error(error);
  }
};

const openEditModal = (suggestion) => {
  currentSuggestion.value = { ...suggestion };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  currentSuggestion.value = null;
};

const handleUpdate = async () => {
  if (!currentSuggestion.value) return;
  try {
    const id = currentSuggestion.value._id;
    // Precisamos enviar apenas os campos que podem ser editados no formulário
    const updatePayload = {
      title: currentSuggestion.value.title,
      description: currentSuggestion.value.description,
      type: currentSuggestion.value.type,
      status: currentSuggestion.value.status,
    };
    const response = await apiClient.put(`/suggestions/${id}`, updatePayload);
    
    const index = suggestions.value.findIndex(s => s._id === id);
    if (index !== -1) {
      // Para garantir que os dados completos (como createdBy) sejam mantidos,
      // buscamos a lista novamente. É mais seguro.
      await fetchSuggestions();
    }
    
    toast.success('Sugestão atualizada com sucesso!');
    closeModal();
  } catch (error) {
    toast.error('Erro ao atualizar sugestão.');
    console.error(error);
  }
};

const handleDelete = async (id) => {
  if (confirm('Tem certeza que deseja excluir esta sugestão? Esta ação é irreversível.')) {
    try {
      await apiClient.delete(`/suggestions/${id}`);
      suggestions.value = suggestions.value.filter(s => s._id !== id);
      toast.success('Sugestão excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir sugestão.');
      console.error(error);
    }
  }
};

const toggleStatus = async (suggestion) => {
  const newStatus = suggestion.status === 'Concluído' ? 'Pendente' : 'Concluído';
  
  try {
    const response = await apiClient.put(`/suggestions/${suggestion._id}`, { status: newStatus });
    
    const index = suggestions.value.findIndex(s => s._id === suggestion._id);
    if (index !== -1) {
      suggestions.value[index].status = response.data.data.status;
    }
    toast.success(`Status alterado para "${newStatus}"!`);
  } catch (error) {
    toast.error('Erro ao alterar o status.');
    console.error(error);
  }
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

const getTypeClass = (type) => {
  return type === 'Melhoria' ? 'bg-blue-600 text-blue-100' : 'bg-orange-600 text-orange-100';
};

const getStatusClass = (status) => {
  if (status === 'Pendente') return 'bg-yellow-600 text-yellow-100';
  if (status === 'Concluído') return 'bg-green-600 text-green-100';
  return 'bg-gray-600 text-gray-100';
};

onMounted(fetchSuggestions);
</script>