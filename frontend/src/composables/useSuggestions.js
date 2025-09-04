// frontend/src/composables/useSuggestions.js
import { ref } from 'vue';
import apiClient from '../api';
import { useToast } from 'vue-toastification';

export function useSuggestions() {
  const toast = useToast();
  const suggestions = ref([]);
  const isLoading = ref(false);

  const fetchSuggestions = async () => {
    isLoading.value = true;
    try {
      const response = await apiClient.get('/suggestions');
      suggestions.value = response.data.data;
    } catch (error) {
      toast.error('Erro ao buscar sugestões.');
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  };

  const createSuggestion = async (newSuggestionData) => {
    isLoading.value = true;
    try {
      await apiClient.post('/suggestions', newSuggestionData);
      toast.success('Sugestão enviada com sucesso!');
      await fetchSuggestions(); // Atualiza a lista
      return true; // Indica sucesso
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao enviar sugestão.');
      console.error(error);
      return false; // Indica falha
    } finally {
      isLoading.value = false;
    }
  };

  const updateSuggestion = async (suggestionToUpdate) => {
    isLoading.value = true;
    try {
      const { _id, ...updatePayload } = suggestionToUpdate;
      await apiClient.put(`/suggestions/${_id}`, updatePayload);
      toast.success('Sugestão atualizada com sucesso!');
      await fetchSuggestions();
      return true;
    } catch (error) {
      toast.error('Erro ao atualizar sugestão.');
      console.error(error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteSuggestion = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta sugestão? Esta ação é irreversível.')) {
      isLoading.value = true;
      try {
        await apiClient.delete(`/suggestions/${id}`);
        toast.success('Sugestão excluída com sucesso!');
        await fetchSuggestions();
        return true;
      } catch (error) {
        toast.error('Erro ao excluir sugestão.');
        console.error(error);
        return false;
      } finally {
        isLoading.value = false;
      }
    }
    return false;
  };

  return {
    suggestions,
    isLoading,
    fetchSuggestions,
    createSuggestion,
    updateSuggestion,
    deleteSuggestion,
  };
}