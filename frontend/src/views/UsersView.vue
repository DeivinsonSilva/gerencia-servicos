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
              <select v-model="newUser.type" id="userType" class="form-select">
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
                    <button class="font-medium text-white bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-md text-xs transition-colors">Editar</button>
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const users = ref([]);
const newUser = ref({ name: '', login: '', password: '', type: 'Operador' });
const API_URL = 'http://localhost:3000/api/users';
const currentUserRole = ref(null);

const isAdmin = computed(() => currentUserRole.value === 'Admin');

const getAuthConfig = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { 'x-auth-token': token } };
};

const fetchUsers = async () => {
  if (!isAdmin.value) return; // Se não for admin, nem tenta buscar
  try {
    const response = await axios.get(API_URL, getAuthConfig());
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
    await axios.post(`${API_URL}/register`, newUser.value, getAuthConfig());
    newUser.value = { name: '', login: '', password: '', type: 'Operador' };
    await fetchUsers();
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    alert('Não foi possível adicionar o usuário.');
  }
};

const deleteUser = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthConfig());
    await fetchUsers();
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    alert('Não foi possível deletar o usuário.');
  }
};

onMounted(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    const decoded = jwtDecode(token);
    currentUserRole.value = decoded.user.role;
    fetchUsers(); // Chama a busca de usuários após verificar o papel
  }
});
</script>