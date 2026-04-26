<!--
  CONCEPTO: Componente presentacional para filtrar por tipo

  Recibe la lista de tipos disponibles y el tipo seleccionado.
  Emite 'selectType' cuando el usuario clickea un chip.
  No tiene lógica de negocio: es 100% presentacional.
-->
<script setup lang="ts">
import { TYPE_COLORS } from '@/types/pokemon'

defineProps<{
  selectedType: string | null
  isLoading?: boolean
}>()

const emit = defineEmits<{
  selectType: [type: string | null]
}>()

// Los 18 tipos de Pokémon en el orden canónico
const TYPES = Object.keys(TYPE_COLORS)

function toggle(type: string) {
  // Si el tipo ya está seleccionado, lo deselecciona (vuelve a null)
  emit('selectType', type)
}

function clearFilter() {
  emit('selectType', null)
}
</script>

<template>
  <div class="type-filter">
    <div class="type-filter__chips">
      <!-- Chip "Todos" para resetear el filtro -->
      <button
        class="type-filter__chip type-filter__chip--all"
        :class="{ 'type-filter__chip--active': selectedType === null }"
        :disabled="isLoading"
        @click="clearFilter"
      >
        Todos
      </button>

      <button
        v-for="type in TYPES"
        :key="type"
        class="type-filter__chip"
        :class="{ 'type-filter__chip--active': selectedType === type }"
        :style="{
          '--type-color': TYPE_COLORS[type],
          borderColor: selectedType === type ? TYPE_COLORS[type] : 'transparent',
        }"
        :disabled="isLoading"
        @click="toggle(type)"
      >
        {{ type }}
      </button>
    </div>
  </div>
</template>
