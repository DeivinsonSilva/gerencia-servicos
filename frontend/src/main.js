// frontend/src/main.js
import './assets/theme.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// --- NOVAS LINHAS ---
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css' // Importa o CSS padrão
// --- FIM DAS NOVAS LINHAS ---

const app = createApp(App)

app.use(router)

// --- NOVA LINHA ---
// Registra o plugin de toast com algumas opções padrão
app.use(Toast, {
    transition: "Vue-Toastification__bounce",
    maxToasts: 5,
    newestOnTop: true,
    position: "top-right",
    timeout: 4000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
});
// --- FIM DA NOVA LINHA ---

app.mount('#app')