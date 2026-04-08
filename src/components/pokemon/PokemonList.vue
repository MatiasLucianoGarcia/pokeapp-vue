<!--
  CONCEPTO: Transiciones de lista con <TransitionGroup>

  <TransitionGroup> aplica animaciones CSS cuando:
    - Un elemento entra al DOM (v-enter-*)
    - Un elemento sale del DOM (v-leave-*)
    - Un elemento se mueve dentro de la lista (v-move)

  IMPORTANTE: a diferencia de <Transition>, <TransitionGroup>
  requiere que cada hijo tenga una 'key' única.

  PokemonList también demuestra cómo un COMPONENTE CONTENEDOR
  recibe una lista y la renderiza como grid, sin conocer los
  detalles de negocio del favoritos.
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
}>()

function onToggleFavorite(id: number) {
  emit('toggleFavorite', id)
}
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
        @toggle-favorite="onToggleFavorite"
      />
    </li>
  </TransitionGroup>

  <div v-else class="pokemon-list__empty">
    <p>😕 No hay Pokémon que coincidan con tu búsqueda</p>
  </div>
</template>
