// ============================================================
// CONCEPTO: Vue Router — Sistema de rutas de Vue 3
//
// createRouter() define el sistema de navegación de la SPA.
// createWebHistory() usa la History API del browser (URLs limpias).
//
// Cada ruta tiene:
//   - path: la URL
//   - name: identificador (para navegar programáticamente)
//   - component: qué vista renderizar
//
// Navigation Guards: beforeEach() se ejecuta ANTES de cada navegación.
// Sirve para autenticación, analytics, scroll reset, etc.
// ============================================================

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Pokédex — Todos los Pokémon' },
    },
    {
      path: '/pokemon/:name',
      name: 'pokemon-detail',
      // Lazy loading: el componente solo se descarga cuando el usuario
      // navega a esta ruta. Vue Router hace el import() automáticamente.
      component: () => import('@/views/PokemonDetailView.vue'),
      meta: { title: 'Pokédex — Detalle' },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue'),
      meta: { title: 'Pokédex — Mis Favoritos' },
    },
    {
      // Catch-all: cualquier ruta desconocida redirige al inicio
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],

  // scrollBehavior: controla el scroll al navegar entre rutas
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      // Si el usuario usó "atrás", restaura la posición anterior
      return savedPosition
    }
    // En cualquier navegación nueva, vuelve al inicio
    return { top: 0 }
  },
})

// Navigation Guard global: actualiza el <title> del documento
// based on la meta.title de cada ruta
router.beforeEach((to) => {
  const title = to.meta.title as string | undefined
  if (title) document.title = title
})

export default router
