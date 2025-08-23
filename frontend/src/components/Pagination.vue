<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center space-x-1 text-slate-300">
    <button 
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
      class="pagination-button">
      « Anterior
    </button>

    <template v-for="(page, index) in pages" :key="index">
      <span v-if="page === '...'" class="px-4 py-2">...</span>
      <button v-else
        @click="changePage(page)"
        :class="['pagination-button', { 'bg-blue-600 text-white': page === currentPage }]">
        {{ page }}
      </button>
    </template>

    <button 
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
      class="pagination-button">
      Próxima »
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});

const emit = defineEmits(['page-changed']);

const changePage = (page) => {
  if (page > 0 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-changed', page);
  }
};

// A "mágica" para gerar a lista de páginas a serem exibidas
const pages = computed(() => {
  const range = [];
  const delta = 2; // Quantas páginas mostrar antes e depois da atual
  const left = props.currentPage - delta;
  const right = props.currentPage + delta;
  
  let l;

  for (let i = 1; i <= props.totalPages; i++) {
    if (i === 1 || i === props.totalPages || (i >= left && i <= right)) {
      if (l) {
        if (i - l === 2) {
          range.push(l + 1);
        } else if (i - l !== 1) {
          range.push('...');
        }
      }
      range.push(i);
      l = i;
    }
  }
  return range;
});
</script>

<style scoped>
.pagination-button {
  @apply px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm;
}
</style>