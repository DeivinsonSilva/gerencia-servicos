<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-10 flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-400"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
        <h1 class="text-3xl font-bold text-white">Dashboard do Administrador</h1>
      </header>

      <div v-if="isLoading" class="text-center py-10">
        <p class="text-slate-400">Carregando estatísticas...</p>
      </div>

      <main v-if="!isLoading && stats" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div class="card p-4 text-center border-t-4 border-cyan-500">
                <p class="text-sm text-slate-400">Banco de Dados Ativo</p>
                <p class="text-2xl font-bold text-cyan-400 mt-1">{{ stats.dbInfo.dbName }}</p>
            </div>
            <div class="card p-4 text-center">
                <p class="text-sm text-slate-400">Status da Conexão</p>
                <p class="text-2xl font-bold text-green-400 mt-1">{{ stats.systemInfo.dbStatus }}</p>
            </div>
            <div class="card p-4 text-center">
                <p class="text-sm text-slate-400">Acessos ao Sistema</p>
                <p class="text-2xl font-bold text-white mt-1">{{ stats.totalLogins }}</p>
            </div>
            <div class="card p-4 text-center">
                <p class="text-sm text-slate-400">Espaço Ocupado</p>
                <p class="text-2xl font-bold text-white mt-1">{{ stats.dbInfo.storageSize }}</p>
            </div>
            <div class="card p-4 text-center">
                <p class="text-sm text-slate-400">Versão Node.js</p>
                <p class="text-2xl font-bold text-white mt-1">{{ stats.systemInfo.nodeVersion }}</p>
            </div>
        </div>
        
        <div class="card">
            <div class="p-6">
                <h2 class="text-xl font-semibold text-slate-200">Gerenciamento de Dados</h2>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome da Tabela (Coleção)</th>
                            <th>Quantidade de Registros</th>
                            <th class="text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="collection in stats.collectionStats" :key="collection.name">
                            <td class="font-medium text-white">{{ collection.label || collection.name }}</td>
                            <td>{{ collection.count }}</td>
                            <td class="text-right">
                                <button v-if="collection.name !== 'Users'" @click="clearCollection(collection.name)" class="btn btn-danger text-xs px-3 py-1">
                                    Limpar Tabela
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card border-red-500/50 p-6">
            <h2 class="text-xl font-semibold text-red-400">Zona de Perigo</h2>
            <p class="text-slate-400 mt-2">A ação abaixo é irreversível e irá apagar **TODOS** os registros de trabalho, fazendas, serviços e trabalhadores. Apenas os usuários do sistema serão mantidos.</p>
            <div class="mt-4">
                <button class="btn btn-danger">Limpar Todas as Tabelas</button>
            </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api.js';

const stats = ref(null);
const isLoading = ref(true);

const fetchStats = async () => {
    isLoading.value = true;
    try {
        const response = await api.get('/admin/stats');
        stats.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar estatísticas do administrador:", error);
    } finally {
        isLoading.value = false;
    }
};

const clearCollection = async (collectionName) => {
    const confirmation = prompt(`Atenção! Esta ação é irreversível e irá apagar todos os registros da tabela "${collectionName}".\n\nPara confirmar, digite o nome da tabela abaixo:`);
    if (confirmation === collectionName) {
        try {
            const response = await api.delete(`/admin/collection/${collectionName}`);
            alert(response.data.msg);
            await fetchStats();
        } catch (error) {
            console.error(`Erro ao limpar a coleção ${collectionName}:`, error);
            alert(error.response?.data?.msg || `Não foi possível limpar a tabela ${collectionName}.`);
        }
    } else if (confirmation !== null) {
        alert('Nome da tabela incorreto. A operação foi cancelada.');
    }
};

onMounted(fetchStats);
</script>