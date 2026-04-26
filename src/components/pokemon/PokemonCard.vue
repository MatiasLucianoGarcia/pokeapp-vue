<!--
  CONCEPTO: Props + Emits — Comunicación Padre → Hijo → Padre

  El flujo de datos en Vue es UNIDIRECCIONAL:
    Padre pasa datos al hijo via PROPS (hacia abajo) ↓
    Hijo comunica eventos al padre via EMITS (hacia arriba) ↑

  NUNCA modifiques una prop directamente desde el hijo (mutation).

  ACTUALIZACIÓN: ahora emite 'quickView' en vez de navegar internamente.
  Esto demuestra el patrón correcto: el hijo NO decide qué pasa con el click,
  solo comunica el evento. El padre (HomeView) decide abrir el modal.

  TAMBIÉN DEMUESTRA: inject() para leer el tema del contexto global.
-->
<script setup lang="ts">
import { computed, inject } from 'vue'
import PokemonTypeBadge from './PokemonTypeBadge.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import type { PokemonListItem } from '@/types/pokemon'
import { extractIdFromUrl } from '@/types/pokemon'
import { THEME_KEY } from '@/symbols'

const props = defineProps<{
  pokemon: PokemonListItem
  isFavorite: boolean
}>()

const emit = defineEmits<{
  toggleFavorite: [pokemonId: number]
  // quickView: el padre decide qué hacer con este evento
  // (abrir modal, navegar, etc.) — la card no asume nada
  quickView: [pokemonName: string]
}>()

// inject() lee el valor provisto por un ancestro con provide()
const theme = inject(THEME_KEY, undefined)
void theme // usado para demostrar inject, el CSS lo maneja el data-theme

const pokemonId = computed(() => extractIdFromUrl(props.pokemon.url))

const imageUrl = computed(
  () =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId.value}.png`,
)

const formattedName = computed(
  () =>
    props.pokemon.name.charAt(0).toUpperCase() + props.pokemon.name.slice(1),
)

const formattedId = computed(() => `#${String(pokemonId.value).padStart(3, '0')}`)

function handleFavoriteClick(event: MouseEvent) {
  event.stopPropagation()
  emit('toggleFavorite', pokemonId.value)
}

function handleCardClick() {
  // El hijo emite el evento y el padre decide qué hacer
  emit('quickView', props.pokemon.name)
}
</script>

<template>
  <BaseCard hoverable padding="sm" class="pokemon-card" @click="handleCardClick">
    <template #header>
      <div class="pokemon-card__img-wrapper">
        <img
          :src="imageUrl"
          :alt="formattedName"
          class="pokemon-card__img"
          loading="lazy"
        />
        <button
          class="pokemon-card__favorite"
          :class="{ 'pokemon-card__favorite--active': isFavorite }"
          :aria-label="isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
          @click="handleFavoriteClick"
        >
          {{ isFavorite ? '❤️' : '🤍' }}
        </button>
      </div>
    </template>

    <div class="pokemon-card__info">
      <span class="pokemon-card__id">{{ formattedId }}</span>
      <h3 class="pokemon-card__name">{{ formattedName }}</h3>
    </div>
  </BaseCard>
</template>
