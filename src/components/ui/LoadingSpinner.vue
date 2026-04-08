<!--
  CONCEPTO: Lifecycle Hooks en Composition API

  onMounted()   → el componente fue insertado en el DOM
  onUnmounted() → el componente fue eliminado del DOM (cleanup)

  Esto es equivalente a mounted() y beforeUnmount() en Options API,
  pero importados como funciones — composables-friendly.

  Caso de uso clásico: iniciar/detener timers, suscribir/desuscribir eventos.
-->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    message?: string
  }>(),
  {
    size: 'md',
    message: 'Cargando...',
  },
)

// Estado interno para la animación de puntos suspensivos
const dots = ref('')
let intervalId: ReturnType<typeof setInterval> | null = null

// onMounted: inicia el timer cuando el componente entra al DOM
onMounted(() => {
  intervalId = setInterval(() => {
    dots.value = dots.value.length >= 3 ? '' : dots.value + '.'
  }, 400)
})

// onUnmounted: limpia el timer cuando el componente sale del DOM.
// SIN esto tendríamos un MEMORY LEAK: el timer seguiría corriendo
// aunque el componente ya no exista.
onUnmounted(() => {
  if (intervalId !== null) clearInterval(intervalId)
})
</script>

<template>
  <div class="loading-spinner" :class="`loading-spinner--${size}`" role="status" :aria-label="message">
    <div class="loading-spinner__pokeball">
      <div class="loading-spinner__pokeball-top" />
      <div class="loading-spinner__pokeball-center" />
      <div class="loading-spinner__pokeball-bottom" />
    </div>
    <p class="loading-spinner__message">{{ message }}{{ dots }}</p>
  </div>
</template>
