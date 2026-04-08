<!--
  CONCEPTO: provide() — El componente raíz como proveedor de contexto

  provide(key, value) inyecta un valor en TODOS los descendientes del árbol.
  Cualquier componente hijo (a cualquier profundidad) puede leer este valor
  con inject(key) sin necesidad de pasar props en cadena (prop drilling).

  REGLA: el valor provisto ES reactivo si es un Ref.
  Los hijos pueden LEER y también MODIFICAR la Ref (ej: AppHeader togglea el tema).

  CUÁNDO USAR provide/inject vs Pinia:
    - provide/inject: contexto UI localizado (tema, locale, modal root)
    - Pinia: estado de negocio global (usuario, carrito, favoritos)

  TAMBIÉN DEMUESTRA:
    - <RouterView>: placeholder donde Vue Router renderiza la vista activa
    - <Transition> en routes: anima las transiciones entre páginas
    - :class binding con el tema para aplicar el modo oscuro/claro
-->
<script setup lang="ts">
import { ref, provide } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { THEME_KEY } from '@/symbols'

// Estado global del tema — Ref<'dark' | 'light'>
const theme = ref<'dark' | 'light'>('dark')

// provide() expone 'theme' a TODA la app mediante el THEME_KEY Symbol tipado.
// Cualquier componente puede hacer inject(THEME_KEY) y obtener este mismo Ref.
provide(THEME_KEY, theme)
</script>

<template>
  <!-- :data-theme aplica el tema como atributo CSS en el root, 
       permitiendo overrides de variables CSS según el tema -->
  <div id="app" :data-theme="theme">
    <AppHeader />

    <div class="app-content">
      <!-- <Transition> envuelve <RouterView> para animar entre rutas -->
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <!-- :key="$route.path" fuerza a Vue a recrear el componente
               en cada navegación (importante para que la animación funcione) -->
          <component :is="Component" :key="$route.path" />
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
