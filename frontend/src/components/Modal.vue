<template>
  <div v-if="show" 
       class="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
       @click.self="close">
    <div class="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 border border-slate-700">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold text-white">
          <slot name="header">Título do Modal</slot>
        </h3>
        <button @click="close" class="text-slate-400 hover:text-white">&times;</button>
      </div>
      <div>
        <slot name="body">Conteúdo do modal...</slot>
      </div>
      <div class="mt-6 flex justify-end space-x-4">
        <slot name="footer">
          <button @click="close" class="btn bg-slate-600 hover:bg-slate-500">Fechar</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>