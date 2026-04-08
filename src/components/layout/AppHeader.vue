<!--
  CONCEPTO: inject() en componentes de layout + useRouter

  AppHeader usa inject(THEME_KEY) para leer Y MODIFICAR el tema,
  demostrando que inject() puede recibir valores reactivos (Ref)
  que el hijo puede mutar (si la ref fue creada en el padre).

  RouterLink: el componente de navegación de Vue Router.
    - No recarga la página (SPA navigation)
    - Agrega automáticamente la clase 'router-link-active' cuando
      la ruta coincide con el 'to' destino.

  useRouter(): acceso programático al router desde Composition API.
  useRoute(): acceso a la ruta actual (params, query, meta).
-->
<script setup lang="ts">
import { inject, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import { THEME_KEY } from '@/symbols'

// inject retorna Ref<'dark' | 'light'> gracias al InjectionKey tipado
const theme = inject(THEME_KEY)

const route = useRoute()
const favoritesStore = useFavoritesStore()

// computed: ¿estamos en la ruta de favoritos?
const isOnFavorites = computed(() => route.name === 'favorites')

function toggleTheme() {
  if (theme) {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <!-- RouterLink genera un <a> que no recarga la página -->
      <RouterLink to="/" class="app-header__logo">
        <span class="app-header__logo-icon">⚡</span>
        <span class="app-header__logo-text">Pokédex</span>
      </RouterLink>

      <nav class="app-header__nav">
        <RouterLink
          to="/"
          class="app-header__nav-link"
          :class="{ 'app-header__nav-link--active': route.name === 'home' }"
        >
          Todos
        </RouterLink>
        <RouterLink
          to="/favorites"
          class="app-header__nav-link"
          :class="{ 'app-header__nav-link--active': isOnFavorites }"
        >
          ❤️ Favoritos
          <!-- v-if: renderiza condicionalmente EN el DOM -->
          <span v-if="favoritesStore.favoritesCount > 0" class="app-header__badge">
            {{ favoritesStore.favoritesCount }}
          </span>
        </RouterLink>
      </nav>

      <button
        class="app-header__theme-toggle"
        :aria-label="`Cambiar a modo ${theme?.value === 'dark' ? 'claro' : 'oscuro'}`"
        @click="toggleTheme"
      >
        {{ theme?.value === 'dark' ? '☀️' : '🌙' }}
      </button>
    </div>
  </header>
</template>
