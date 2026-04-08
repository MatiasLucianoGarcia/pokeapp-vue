<!--
  CONCEPTO: Slots — Composición de componentes en Vue

  Los slots permiten que el PADRE inyecte contenido dentro del hijo.
  Son el equivalente a "children" de React, pero más potentes.

  TIPOS DE SLOTS:
  1. Default slot:        <slot /> — contenido genérico
  2. Named slots:         <slot name="header" /> — contenido específico
  3. Scoped slots:        <slot :data="localData" /> — el padre recibe datos del hijo

  BaseCard usa default + named slots para ser un contenedor flexible.
  Cualquier componente puede usar BaseCard sin repetir el diseño base.
-->
<script setup lang="ts">
// CONCEPTO: defineProps — Define las props de este componente.
// Con <script setup>, no necesitás exportar nada manualmente.
// TypeScript infiere los types directamente.
withDefaults(
  defineProps<{
    hoverable?: boolean
    padding?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'glass' | 'solid'
  }>(),
  {
    hoverable: false,
    padding: 'md',
    variant: 'default',
  },
)
</script>

<template>
  <div
    class="base-card"
    :class="[`base-card--${variant}`, `base-card--p-${padding}`, { 'base-card--hoverable': hoverable }]"
  >
    <!-- Named slot "header": el padre puede inyectar un encabezado específico -->
    <div v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </div>

    <!-- Default slot: contenido principal -->
    <div class="base-card__body">
      <slot />
    </div>

    <!-- Named slot "footer": opcional, solo renderiza el wrapper si hay contenido -->
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>
