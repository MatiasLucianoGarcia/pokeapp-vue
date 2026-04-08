// ============================================================
// CONCEPTO: main.ts — Punto de entrada y registro de plugins
//
// createApp(App): crea la instancia de la aplicación Vue.
// .use(plugin): registra plugins (Router, Pinia) en la app.
//   - Pinia: habilita el store global
//   - Router: habilita <RouterView>, <RouterLink> y useRouter()
//
// El orden importa: primero Pinia, luego Router (el router puede
// depender del store en navigation guards).
//
// .mount('#app'): monta la app en el elemento del index.html con id="app"
// ============================================================

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// Plugin 1: Pinia — state management
app.use(createPinia())

// Plugin 2: Vue Router — sistema de rutas
app.use(router)

// Monta la app en el DOM
app.mount('#app')
