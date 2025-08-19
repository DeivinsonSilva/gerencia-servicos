<template>
  <div class="min-h-screen bg-slate-900 font-sans text-slate-200 flex items-center justify-center p-4">
    <div class="w-full max-w-5xl">
      <div class="card grid md:grid-cols-2 shadow-2xl overflow-hidden">
        
        <div class="p-8 md:p-12">
          <h2 class="text-3xl font-bold text-white mb-2">Acessar o Sistema</h2>
          <p class="text-slate-400 mb-8">Utilize suas credenciais para entrar.</p>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label for="login" class="form-label">Login</label>
              <input v-model="loginInput" type="text" id="login" class="form-input" placeholder="Seu login de acesso">
            </div>
            <div>
              <label for="password" class="form-label">Senha</label>
              <input v-model="passwordInput" type="password" id="password" class="form-input" placeholder="••••••••">
            </div>
            
            <div v-if="errorMessage" class="bg-red-500/20 text-red-300 text-sm p-3 rounded-md">
              {{ errorMessage }}
            </div>

            <div class="pt-2">
              <button type="submit" class="w-full btn btn-primary">
                Entrar
              </button>
            </div>
          </form>
        </div>

        <div class="hidden md:block bg-slate-900/50 p-12">
           <h1 class="text-white text-3xl font-bold tracking-wider mb-4">
              SISTEMA DE GERENCIAMENTO
            </h1>
            <p class="text-slate-300 leading-relaxed">
              Esta é uma plataforma completa para administração de suas operações. Gerencie serviços, fazendas e usuários de forma centralizada e eficiente.
            </p>
            <p class="mt-4 text-sm text-slate-400">
              Acesse os módulos através do painel principal após autenticação.
            </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // 1. Importamos o axios
import { login } from '@/data/store.js'; // Vamos usar nossa nova função do store

const router = useRouter();

const loginInput = ref('');
const passwordInput = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';

  try {
    // 2. Fazemos a chamada POST para a nossa API
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      login: loginInput.value,
      password: passwordInput.value,
    });

    // 3. Se a chamada for bem-sucedida, pegamos o token da resposta
    const token = response.data.token;
    
    // 4. Usamos nossa nova função login do store para salvar o token e o usuário
    login(token);

    // 5. Redirecionamos para o dashboard
    router.push({ name: 'dashboard' });

  } catch (error) {
    // 6. Se a API retornar um erro (ex: 400), o capturamos aqui
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.msg || 'Ocorreu um erro. Tente novamente.';
    } else {
      errorMessage.value = 'Não foi possível conectar ao servidor.';
    }
  }
};
</script>