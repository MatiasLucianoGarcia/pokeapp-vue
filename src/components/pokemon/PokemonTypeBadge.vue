<!--
  CONCEPTO: Componente presentacional puro
  
  Este componente NO tiene lógica, solo recibe datos y los muestra.
  Esto es el patrón "Presentational / Container" adaptado a Vue:
    - Presentacional: recibe todo por props, emite eventos simples
    - Container (Smart): tiene lógica, usa composables, llama a la API
  
  PokemonTypeBadge es 100% presentacional.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { TYPE_COLORS } from '@/types/pokemon'

const props = defineProps<{
  typeName: string
  size?: 'sm' | 'md'
}>()

// computed: derive el color basado en el tipo
const bgColor = computed(() => TYPE_COLORS[props.typeName] ?? '#888')
</script>

<template>
  <span
    class="type-badge"
    :class="`type-badge--${size ?? 'md'}`"
    :style="{ backgroundColor: bgColor }"
  >
    {{ typeName }}
  </span>
</template>
