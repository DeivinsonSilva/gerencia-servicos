// frontend/src/data/store.js
import { ref } from 'vue';
import api from '@/api.js'; // Importamos nosso helper centralizado
import { jwtDecode } from 'jwt-decode';

export const currentUser = ref(null);

/**
 * Busca os dados completos do usuário logado usando o token salvo.
 */
async function fetchCurrentUser() {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      // Usamos o 'api' que já tem o token e a URL base corretos
      const response = await api.get('/auth/me'); 
      currentUser.value = response.data;
    } catch (error) {
      console.error("Falha ao buscar usuário, limpando sessão:", error);
      logout(); // Se o token for inválido, limpa a sessão
    }
  }
}

/**
 * Salva o token e busca os dados do usuário.
 * @param {string} token - O token JWT recebido da API.
 */
export async function login(token) {
  localStorage.setItem('authToken', token);
  await fetchCurrentUser();
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