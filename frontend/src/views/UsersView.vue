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
              <button type="submit" class="btn btn-primary">Salvar</button>
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
                  <td class="flex items-center gap-2">
                    <button @click="openEditModal(user)" class="font-medium text-white bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-md text-xs transition-colors">Editar</button>
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

  <Modal :show="isModalOpen" @close="isModalOpen = false">
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
      <button @click="isModalOpen = false" class="btn bg-slate-600 hover:bg-slate-500">Cancelar</button>
      <button @click="updateUser" class="btn btn-primary">Salvar Alterações</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api.js';
import { jwtDecode } from 'jwt-decode';
import Modal from '@/components/Modal.vue';

const users = ref([]);
const newUser = ref({ name: '', login: '', password: '', role: 'Operador' }); // Corrigido de 'type' para 'role'
const isModalOpen = ref(false);
const editingUser = ref({ _id: null, name: '', login: '', role: '' });
const currentUser = ref(null);

const isAdmin = computed(() => currentUser.value && currentUser.value.role === 'Admin');

const fetchUsers = async () => {
  if (!isAdmin.value) return;
  try {
    const response = await api.get('/users');
    users.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    alert('Não foi possível carregar os usuários.');
  }
};

const addUser = async () => {
  if (!newUser.value.name || !newUser.value.login || !newUser.value.password) {
    return alert('Por favor, preencha todos os campos.');
  }
  try {
    await api.post('/users/register', newUser.value);
    newUser.value = { name: '', login: '', password: '', role: 'Operador' };
    await fetchUsers();
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    alert('Não foi possível adicionar o usuário.');
  }
};

const openEditModal = (user) => {
  editingUser.value = { ...user };
  isModalOpen.value = true;
};

const updateUser = async () => {
  if (!editingUser.value._id) return;
  try {
    await api.put(`/users/${editingUser.value._id}`, editingUser.value);
    isModalOpen.value = false;
    await fetchUsers();
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    alert('Não foi possível atualizar o usuário.');
  }
};

const deleteUser = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
  try {
    await api.delete(`/users/${id}`);
    await fetchUsers();
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    alert('Não foi possível deletar o usuário.');
  }
};

onMounted(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    currentUser.value = jwtDecode(token).user;
    fetchUsers();
  }
});
</script>