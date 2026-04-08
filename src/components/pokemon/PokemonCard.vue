<!--
  CONCEPTO: Props + Emits — Comunicación Padre → Hijo → Padre

  El flujo de datos en Vue es UNIDIRECCIONAL:
    Padre pasa datos al hijo via PROPS (hacia abajo) ↓
    Hijo comunica eventos al padre via EMITS (hacia arriba) ↑

  NUNCA modifiques una prop directamente desde el hijo (mutation).
  En cambio, emití un evento y dejá que el PADRE decida qué hacer.
  
  PokemonCard recibe datos del pokemon (prop) y emite cuando el
  usuario clickea favorito (emit), sin saber nada de Pinia.
  
  TAMBIÉN DEMUESTRA: inject() para leer el tema del contexto global.
-->
<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'
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
  // 'toggleFavorite' es el nombre del evento
  // El tipo del payload es el ID del pokémon
  toggleFavorite: [pokemonId: number]
}>()

// inject() lee el valor provisto por un ancestro con provide()
// El THEME_KEY es un Symbol único que evita colisiones de nombres
const theme = inject(THEME_KEY, 'dark')

const router = useRouter()

// ID extraído de la URL de la lista (evita hacer un fetch extra)
const pokemonId = computed(() => extractIdFromUrl(props.pokemon.url))

// Imagen de sprite oficial desde la URL predecible de la API
const imageUrl = computed(
  () =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId.value}.png`,
)

// Nombre formateado: "bulbasaur" → "Bulbasaur"
const formattedName = computed(
  () =>
    props.pokemon.name.charAt(0).toUpperCase() + props.pokemon.name.slice(1),
)

// Número formateado: 1 → "#001"
const formattedId = computed(() => `#${String(pokemonId.value).padStart(3, '0')}`)

function handleFavoriteClick(event: MouseEvent) {
  event.stopPropagation() // Evita que el click llegue a la card
  emit('toggleFavorite', pokemonId.value)
}

function goToDetail() {
  router.push({ name: 'pokemon-detail', params: { name: props.pokemon.name } })
}
</script>

<template>
  <BaseCard hoverable padding="sm" class="pokemon-card" @click="goToDetail">
    <!-- Slot "header" de BaseCard — aquí va la imagen -->
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

    <!-- Slot default de BaseCard — datos del pokémon -->
    <div class="pokemon-card__info">
      <span class="pokemon-card__id">{{ formattedId }}</span>
      <h3 class="pokemon-card__name">{{ formattedName }}</h3>
    </div>
  </BaseCard>
</template>
