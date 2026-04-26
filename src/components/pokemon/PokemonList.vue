<!--
  CONCEPTO: Transiciones de lista con <TransitionGroup>

  Actualización: ahora también pasa el evento 'quickView' hacia arriba.
  Esta es la cadena de emits: PokemonCard → PokemonList → HomeView
-->
<script setup lang="ts">
import PokemonCard from './PokemonCard.vue'
import type { PokemonListItem } from '@/types/pokemon'
import { extractIdFromUrl } from '@/types/pokemon'

defineProps<{
  pokemonList: PokemonListItem[]
  favoritesIds: Set<number>
}>()

const emit = defineEmits<{
  toggleFavorite: [pokemonId: number]
  quickView: [pokemonName: string]
}>()
</script>

<template>
  <TransitionGroup
    v-if="pokemonList.length > 0"
    tag="ul"
    name="pokemon-grid"
    class="pokemon-list__grid"
  >
    <li
      v-for="pokemon in pokemonList"
      :key="pokemon.name"
      class="pokemon-list__item"
    >
      <PokemonCard
        :pokemon="pokemon"
        :is-favorite="favoritesIds.has(extractIdFromUrl(pokemon.url))"
        @toggle-favorite="(id) => emit('toggleFavorite', id)"
        @quick-view="(name) => emit('quickView', name)"
      />
    </li>
  </TransitionGroup>

  <div v-else class="pokemon-list__empty">
    <p>😕 No hay Pokémon que coincidan con tu búsqueda</p>
  </div>
</template>
