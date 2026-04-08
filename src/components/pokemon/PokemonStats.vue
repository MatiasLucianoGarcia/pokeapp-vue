<!--
  CONCEPTO: computed() para transformaciones complejas de datos

  PokemonStats recibe el array de stats y los transforma con computed():
    1. Ordena en un orden predefinido
    2. Calcula el porcentaje relativo (para la barra de progreso)
    3. Formatea el nombre del stat
  
  Sin computed(), tendrías que hacer esta transformación en el template
  o en cada render. computed() la hace UNA VEZ y la cachea hasta que
  las dependencias cambien.
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { PokemonStat } from '@/types/pokemon'

const props = defineProps<{
  stats: PokemonStat[]
}>()

// Mapa de nombres legibles para cada stat de la API
const STAT_NAMES: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Sp. Ataque',
  'special-defense': 'Sp. Defensa',
  speed: 'Velocidad',
}

// Máximo posible de un stat (basado en datos pokémon reales)
const MAX_STAT = 255

const formattedStats = computed(() =>
  props.stats.map((s) => ({
    name: STAT_NAMES[s.stat.name] ?? s.stat.name,
    value: s.base_stat,
    // El porcentaje determina el ancho de la barra visual
    percentage: Math.round((s.base_stat / MAX_STAT) * 100),
    // Categoría para colorear: bueno ≥ 80, ok ≥ 50, bajo < 50
    tier: s.base_stat >= 80 ? 'high' : s.base_stat >= 50 ? 'mid' : 'low',
  })),
)

// Total de stats: base stat total (BST) del Pokémon
const totalStats = computed(() =>
  props.stats.reduce((sum, s) => sum + s.base_stat, 0),
)
</script>

<template>
  <div class="pokemon-stats">
    <h3 class="pokemon-stats__title">Estadísticas base</h3>
    <ul class="pokemon-stats__list">
      <!-- v-for: renderiza una lista. 'key' es OBLIGATORIO para que Vue
           identifique cada elemento y optimice el re-render (Virtual DOM diff) -->
      <li
        v-for="stat in formattedStats"
        :key="stat.name"
        class="pokemon-stats__item"
      >
        <span class="pokemon-stats__name">{{ stat.name }}</span>
        <span class="pokemon-stats__value">{{ stat.value }}</span>
        <div class="pokemon-stats__bar-bg">
          <div
            class="pokemon-stats__bar-fill"
            :class="`pokemon-stats__bar-fill--${stat.tier}`"
            :style="{ width: `${stat.percentage}%` }"
          />
        </div>
      </li>
    </ul>
    <p class="pokemon-stats__total">
      <strong>Total:</strong> {{ totalStats }}
    </p>
  </div>
</template>
