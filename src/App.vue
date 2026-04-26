<!--
  CONCEPTO: <KeepAlive> — Preservar estado entre navegaciones

  Sin KeepAlive: cada vez que navegás a una ruta, Vue DESTRUYE
  el componente anterior y CREA uno nuevo. La búsqueda y página
  se resetean.

  Con <KeepAlive :include="['HomeView']">:
    - HomeView se "duerme" (onDeactivated) en vez de destruirse
    - Su estado (searchQuery, currentPage, selectedType) se preserva
    - Cuando volvés, se "despierta" (onActivated) sin re-fetch

  :include acepta un array de nombres de componente.
  Por eso HomeView tiene defineOptions({ name: 'HomeView' }).

  TRADEOFF: el componente guardado ocupa memoria.
  Usalo solo para componentes con estado que valga la pena preservar.
  No lo usés en todos lados.

  La `:key` condicional es importante:
  - Home: sin key → KeepAlive puede cachearlo
  - Otras rutas: key = route.path → siempre fresco (importante para
    navegar entre /pokemon/pikachu y /pokemon/charizard)
-->
<script setup lang="ts">
import { ref, provide } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { THEME_KEY } from '@/symbols'

const theme = ref<'dark' | 'light'>('dark')
provide(THEME_KEY, theme)
</script>

<template>
  <div id="app" :data-theme="theme">
    <AppHeader />

    <div class="app-content">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <KeepAlive :include="['HomeView']">
            <component
              :is="Component"
              :key="route.name !== 'home' ? route.path : undefined"
            />
          </KeepAlive>
        </Transition>
      </RouterView>
    </div>

    <footer class="app-footer">
      <p>
        Construido con Vue 3 + Composition API · Datos de
        <a href="https://pokeapi.co" target="_blank" rel="noopener">PokeAPI</a>
      </p>
    </footer>
  </div>
</template>
