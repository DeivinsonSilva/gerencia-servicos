<template>
  <footer class="bg-slate-900 border-t border-slate-700/50 mt-12">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
      &copy; {{ currentYear }} Sistema de Gerenciamento Agrícola. Todos os direitos reservados.
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>
