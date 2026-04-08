<!--
  CONCEPTO: Props tipadas + atributos heredados (fallthrough)

  defineProps<{...}>() define un contrato de entrada tipado.
  Si el padre pasa un atributo que NO está en props (ej: class, id, data-*),
  Vue lo hereda automáticamente en el elemento raíz.

  Con defineEmits declaramos los eventos que este componente puede emitir.
  Esto permite que el padre escuche con @click-button="handler".
-->
<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  icon?: string
}>()

// defineEmits: declara los eventos que este componente puede emitir
// El padre escucha con @click="handler"
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <button
    class="base-button"
    :class="[
      `base-button--${variant ?? 'primary'}`,
      `base-button--${size ?? 'md'}`,
      { 'base-button--loading': loading },
    ]"
    :disabled="disabled || loading"
    :type="type ?? 'button'"
    @click="handleClick"
  >
    <!-- Slot: el padre puede inyectar cualquier contenido -->
    <span v-if="loading" class="base-button__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>
