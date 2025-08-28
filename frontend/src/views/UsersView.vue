<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-white">Gerenciamento de Usuários</h1>
      </header>

      <div v-if="!isAdmin" class="card p-6 text-center">
        <p class="text-amber-400">Você não tem permissão para gerenciar usuários.</p>
      </div>

      <main v-else class="space-y-8">
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-slate-200 mb-5">Cadastrar Novo Usuário</h2>
          <form @submit.prevent="addUser" class="space-y-4">
            <div>
              <label for="userName" class="form-label">Nome Completo:</label>
              <input v-model="newUser.name" type="text" id="userName" class="form-input">
            </div>
            <div>
              <label for="userLogin" class="form-label">Login:</label>
              <input v-model="newUser.login" type="text" id="userLogin" class="form-input">
            </div>
            <div>
              <label for="userPassword" class="form-label">Senha:</label>
              <input v-model="newUser.password" type="password" id="userPassword" class="form-input">
            </div>
            <div>
              <label for="userType" class="form-label">Tipo de Usuário:</label>
              <select v-model="newUser.role" id="userType" class="form-select">
                <option value="Operador">Operador</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div class="pt-2">
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading">Salvando...</span>
                <span v-else>Salvar</span>
              </button>
            </div>
          </form>
        </div>
        <div class="card">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-slate-200">Usuários Cadastrados</h2>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Login</th>
                  <th>Tipo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user._id">
                  <td class="font-medium text-white">{{ user.name }}</td>
                  <td>{{ user.login }}</td>
                  <td>{{ user.role }}</td>
                  <td class="flex items-center gap-2 flex-wrap">
                    <button @click="openEditModal(user)" class="font-medium text-white bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-md text-xs transition-colors">Editar</button>
                    <!-- NOVO BOTÃO DE RESET -->
                    <button @click="openResetModal(user)" class="font-medium text-white bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded-md text-xs transition-colors">Resetar Senha</button>
                    <button @click="deleteUser(user._id)" class="font-medium text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-md text-xs transition-colors">Excluir</button>
                  </td>
                </tr>
                <tr v-if="users.length === 0">
                  <td colspan="4" class="text-center py-10 text-slate-500">Nenhum usuário cadastrado.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- Modal de Edição (Existente) -->
  <Modal :show="isEditModalOpen" @close="isEditModalOpen = false">
    <template #header>Editar Usuário</template>
    <template #body>
      <form @submit.prevent="updateUser" class="space-y-4">
        <div>
          <label for="editUserName" class="form-label">Nome Completo:</label>
          <input v-model="editingUser.name" type="text" id="editUserName" class="form-input">
        </div>
        <div>
          <label for="editUserLogin" class="form-label">Login:</label>
          <input v-model="editingUser.login" type="text" id="editUserLogin" class="form-input">
        </div>
        <div>
          <label for="editUserRole" class="form-label">Tipo de Usuário:</label>
          <select v-model="editingUser.role" id="editUserRole" class="form-select">
            <option value="Operador">Operador</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <p class="text-xs text-slate-500 pt-2">A senha não pode ser alterada através deste formulário.</p>
      </form>
    </template>
    <template #footer>
      <button @click="isEditModalOpen = false" class="btn bg-slate-600 hover:bg-slate-500">Cancelar</button>
      <button @click="updateUser" class="btn btn-primary" :disabled="isLoading">
        <span v-if="isLoading">Salvando...</span>
        <span v-else>Salvar Alterações</span>
      </button>
    </template>
  </Modal>

  <!-- NOVO MODAL PARA RESET DE SENHA -->
  <Modal :show="isResetModalOpen" @close="isResetModalOpen = false">
    <template #header>Resetar Senha</template>
    <template #body>
        <p v-if="userToReset" class="text-slate-300 mb-4">
            Você está definindo uma nova senha para o usuário: <strong class="text-white">{{ userToReset.name }}</strong>.
        </p>
        <form @submit.prevent="handleResetPassword" class="space-y-4">
            <div>
                <label for="newPasswordReset" class="form-label">Nova Senha Temporária:</label>
                <input v-model="newPassword" type="password" id="newPasswordReset" class="form-input" autocomplete="new-password">
            </div>
            <div>
                <label for="confirmNewPasswordReset" class="form-label">Confirmar Nova Senha:</label>
                <input v-model="confirmNewPassword" type="password" id="confirmNewPasswordReset" class="form-input" autocomplete="new-password">
            </div>
        </form>
    </template>
    <template #footer>
        <button @click="isResetModalOpen = false" class="btn bg-slate-600 hover:bg-slate-500">Cancelar</button>
        <button @click="handleResetPassword" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading">Salvando...</span>
            <span v-else>Salvar Nova Senha</span>
        </button>
    </template>
  </Modal>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api.js';
import { jwtDecode } from 'jwt-decode';
import Modal from '@/components/Modal.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();
const users = ref([]);
const newUser = ref({ name: '', login: '', password: '', role: 'Operador' });
const isEditModalOpen = ref(false);
const editingUser = ref({ _id: null, name: '', login: '', role: '' });
const currentUser = ref(null);
const isLoading = ref(false);

// --- NOVAS VARIÁVEIS PARA O RESET DE SENHA ---
const isResetModalOpen = ref(false);
const userToReset = ref(null);
const newPassword = ref('');
const confirmNewPassword = ref('');
// --- FIM DAS NOVAS VARIÁVEIS ---

const isAdmin = computed(() => currentUser.value && currentUser.value.role === 'Admin');

const fetchUsers = async () => {
  if (!isAdmin.value) return;
  try {
    const response = await api.get('/users');
    users.value = response.data;
  } catch (error) {
    toast.error('Não foi possível carregar os usuários.');
  }
};

const addUser = async () => {
  isLoading.value = true;
  try {
    await api.post('/users/register', newUser.value);
    toast.success('Usuário adicionado com sucesso!');
    newUser.value = { name: '', login: '', password: '', role: 'Operador' };
    await fetchUsers();
  } catch (error) {
    const errorMsg = error.response?.data?.errors?.[0]?.msg || 'Não foi possível adicionar o usuário.';
    toast.error(errorMsg);
  } finally {
    isLoading.value = false;
  }
};

const openEditModal = (user) => {
  editingUser.value = { ...user };
  isEditModalOpen.value = true;
};

const updateUser = async () => {
  if (!editingUser.value._id) return;
  isLoading.value = true;
  try {
    await api.put(`/users/${editingUser.value._id}`, editingUser.value);
    toast.success('Usuário atualizado com sucesso!');
    isEditModalOpen.value = false;
    await fetchUsers();
  } catch (error) {
    const errorMsg = error.response?.data?.errors?.[0]?.msg || 'Não foi possível atualizar o usuário.';
    toast.error(errorMsg);
  } finally {
    isLoading.value = false;
  }
};

const deleteUser = async (id) => {
  if (id === currentUser.value?.id) {
    return toast.error('Você não pode deletar o seu próprio usuário.');
  }
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
  try {
    await api.delete(`/users/${id}`);
    toast.success('Usuário removido com sucesso!');
    await fetchUsers();
  } catch (error) {
    toast.error('Não foi possível deletar o usuário.');
  }
};

// --- NOVAS FUNÇÕES PARA O RESET DE SENHA ---
const openResetModal = (user) => {
    userToReset.value = user;
    newPassword.value = '';
    confirmNewPassword.value = '';
    isResetModalOpen.value = true;
};

const handleResetPassword = async () => {
    if (!userToReset.value) return;

    if (newPassword.value !== confirmNewPassword.value) {
        return toast.error('As senhas não correspondem.');
    }
    if (newPassword.value.length < 6) {
        return toast.error('A nova senha deve ter no mínimo 6 caracteres.');
    }

    isLoading.value = true;
    try {
        const response = await api.put(`/users/${userToReset.value._id}/reset-password`, {
            newPassword: newPassword.value
        });
        toast.success(response.data.msg);
        isResetModalOpen.value = false;
    } catch (error) {
        const errorMsg = error.response?.data?.errors?.[0]?.msg || 'Não foi possível resetar a senha.';
        toast.error(errorMsg);
    } finally {
        isLoading.value = false;
    }
};
// --- FIM DAS NOVAS FUNÇÕES ---

onMounted(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    currentUser.value = jwtDecode(token).user;
    fetchUsers();
  }
});
</script>
