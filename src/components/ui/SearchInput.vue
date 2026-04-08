<!--
  CONCEPTO: v-model personalizado en componentes propios

  En Vue 3, v-model en un componente es SYNTACTIC SUGAR de:
    :modelValue="value" + @update:modelValue="value = $event"

  Para implementar v-model en tu componente:
    1. Recibís la prop 'modelValue'
    2. Emitís 'update:modelValue' cuando el valor cambia

  El padre lo usa así:
    <SearchInput v-model="searchQuery" />
  
  Que Vue traduce internamente a:
    <SearchInput :modelValue="searchQuery" @update:modelValue="searchQuery = $event" />

  También se puede nombrar el v-model:
    v-model:search → prop 'search' + emit 'update:search'
-->
<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
  label?: string
}>()

// El emit tipado garantiza que siempre emitamos un string
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function clearInput() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="search-input">
    <label v-if="label" class="search-input__label">{{ label }}</label>
    <div class="search-input__wrapper">
      <span class="search-input__icon" aria-hidden="true">🔍</span>
      <input
        class="search-input__field"
        type="text"
        :value="modelValue"
        :placeholder="placeholder ?? 'Buscar Pokémon...'"
        autocomplete="off"
        @input="onInput"
      />
      <!-- v-show: el elemento siempre está en el DOM, solo cambia display.
           Diferente a v-if: v-if agrega/quita del DOM completamente. -->
      <button
        v-show="modelValue.length > 0"
        class="search-input__clear"
        type="button"
        aria-label="Limpiar búsqueda"
        @click="clearInput"
      >
        ✕
      </button>
    </div>
  </div>
</template>
