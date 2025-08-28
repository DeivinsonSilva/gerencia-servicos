<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-2xl mx-auto">
      <header class="mb-10 flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-400"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <h1 class="text-3xl font-bold text-white">Meu Perfil</h1>
      </header>

      <main class="space-y-8">
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-slate-200 mb-5">Alterar Senha</h2>
          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label for="currentPassword" class="form-label">Senha Atual:</label>
              <input v-model="passwords.currentPassword" type="password" id="currentPassword" class="form-input" autocomplete="current-password">
            </div>
            <div>
              <label for="newPassword" class="form-label">Nova Senha:</label>
              <input v-model="passwords.newPassword" type="password" id="newPassword" class="form-input" autocomplete="new-password">
            </div>
            <div>
              <label for="confirmPassword" class="form-label">Confirmar Nova Senha:</label>
              <input v-model="passwords.confirmPassword" type="password" id="confirmPassword" class="form-input" autocomplete="new-password">
            </div>
            
            <div class="pt-2">
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading">Salvando...</span>
                <span v-else>Salvar Nova Senha</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/api.js';
import { useToast } from 'vue-toastification';

const toast = useToast();
const isLoading = ref(false);
const passwords = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const changePassword = async () => {
  if (passwords.value.newPassword !== passwords.value.confirmPassword) {
    return toast.error('A nova senha e a confirmação não correspondem.');
  }
  if (passwords.value.newPassword.length < 6) {
    return toast.error('A nova senha deve ter no mínimo 6 caracteres.');
  }

  isLoading.value = true;
  try {
    const payload = {
        currentPassword: passwords.value.currentPassword,
        newPassword: passwords.value.newPassword,
    };
    const response = await api.post('/users/change-password', payload);
    toast.success(response.data.msg || 'Senha alterada com sucesso!');
    passwords.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  } catch (error) {
    const errorMsg = error.response?.data?.errors?.[0]?.msg || 'Não foi possível alterar a senha.';
    toast.error(errorMsg);
  } finally {
    // A CORREÇÃO ESTÁ AQUI tá ok
    // Este bloco é executado sempre, tanto em caso de sucesso quanto de erro.
    isLoading.value = false;
  }
};
</script>
