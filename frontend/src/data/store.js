// frontend/src/data/store.js
import { ref } from 'vue';
import axios from 'axios';

export const currentUser = ref(null);
const API_URL = 'http://localhost:3000/api';

/**
 * Busca os dados completos do usuário logado usando o token.
 */
async function fetchCurrentUser() {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const config = { headers: { 'x-auth-token': token } };
      const response = await axios.get(`${API_URL}/auth/me`, config);
      currentUser.value = response.data; // Salva o objeto completo do usuário (com nome, etc)
    } catch (error) {
      // Se o token for inválido/expirado, limpa tudo
      console.error("Falha ao buscar usuário, limpando sessão:", error);
      logout();
    }
  }
}

/**
 * Salva o token e busca os dados do usuário.
 * @param {string} token - O token JWT recebido da API.
 */
export async function login(token) {
  localStorage.setItem('authToken', token);
  await fetchCurrentUser(); // Busca os dados completos do usuário
}

/**
 * Remove o token e limpa o estado do usuário.
 */
export function logout() {
  localStorage.removeItem('authToken');
  currentUser.value = null;
}

// Ao carregar a aplicação, tenta buscar o usuário se um token existir
fetchCurrentUser();