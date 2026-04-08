<!--
  CONCEPTO: HomeView — Vista "Container" (Smart Component)

  Una vista es un "container": tiene lógica de negocio, llama composables,
  conecta con el store de Pinia, y pasa datos a componentes presentacionales.

  Demuestra:
    1. Uso del composable usePokemonList()
    2. Uso del store Pinia useFavoritesStore()
    3. onMounted() para disparar el fetch inicial
    4. computed() para derivar el Set de IDs favoritos (optimiza lookups O(1))
    5. <Transition> en el componente de loading
    6. Paginación manejada por el composable
-->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePokemonList } from '@/composables/usePokemon'
import { useFavoritesStore } from '@/stores/favorites'
import PokemonList from '@/components/pokemon/PokemonList.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

// Composable: toda la lógica de list + search está encapsulada aquí
const {
  isLoadingList,
  error,
  searchQuery,
  paginatedPokemon,
  currentPage,
  totalPages,
  filteredPokemon,
  hasNextPage,
  hasPrevPage,
  fetchAllPokemon,
  nextPage,
  prevPage,
} = usePokemonList()

// Pinia store: los favoritos
const favoritesStore = useFavoritesStore()

// onMounted: cuando esta vista se monta, carga los pokémon
// Solo hace el fetch si no están cargados (el composable lo cachea)
onMounted(() => fetchAllPokemon())

// Convierte la lista de favoritos a un Set de IDs para lookup O(1)
// Sin esto, PokemonCard haría un Array.find() por cada card = O(n)
const favoriteIds = computed<Set<number>>(
  () => new Set(favoritesStore.favoritesList.map((p) => p.id)),
)

function handleToggleFavorite(pokemonId: number) {
  // Busca el pokemon en el store o usa un pokemon simplificado
  const pokemon = favoritesStore.favoritesList.find((p) => p.id === pokemonId)
  if (pokemon) {
    favoritesStore.toggleFavorite(pokemon)
  } else {
    // Si no está en favoritos, necesitamos el objeto completo.
    // La tarjeta solo tiene el ID, así que buscamos el pokemon de la lista.
    // En este caso delegamos la lógica al PokemonDetailView.
    // Alternativa: hacer un fetch adicional aquí.
    // Este trade-off es educational: el favorito desde la lista
    // solo guarda metadata básica para no saturar el store.
    favoritesStore.toggleFavorite({
      id: pokemonId,
      name: paginatedPokemon.value.find(p => {
        const parts = p.url.split('/').filter(Boolean)
        return parseInt(parts[parts.length - 1]) === pokemonId
      })?.name ?? '',
      height: 0,
      weight: 0,
      base_experience: 0,
      sprites: {
        front_default: null,
        other: {
          'official-artwork': { front_default: null },
          dream_world: { front_default: null }
        }
      },
      stats: [],
      types: [],
      abilities: []
    })
  }
}
</script>

<template>
  <main class="home-view">
    <div class="home-view__header">
      <h1 class="home-view__title">
        Pokédex
        <span v-if="!isLoadingList" class="home-view__count">
          ({{ filteredPokemon.length }} Pokémon)
        </span>
      </h1>

      <!-- v-model bindea directamente con searchQuery del composable -->
      <SearchInput
        v-model="searchQuery"
        placeholder="Buscar por nombre..."
        label="Buscar Pokémon"
      />
    </div>

    <!-- <Transition>: anima la aparición/desaparición del spinner
         name="fade": aplica clases CSS .fade-enter-* y .fade-leave-* -->
    <Transition name="fade" mode="out-in">
      <LoadingSpinner v-if="isLoadingList" message="Cargando Pokémon" />

      <div v-else-if="error" class="home-view__error">
        <p>❌ {{ error }}</p>
        <BaseButton @click="fetchAllPokemon">Reintentar</BaseButton>
      </div>

      <div v-else class="home-view__content">
        <PokemonList
          :pokemon-list="paginatedPokemon"
          :favorites-ids="favoriteIds"
          @toggle-favorite="handleToggleFavorite"
        />

        <!-- Paginación -->
        <nav v-if="totalPages > 1" class="home-view__pagination">
          <BaseButton
            variant="ghost"
            size="sm"
            :disabled="!hasPrevPage"
            @click="prevPage"
          >
            ← Anterior
          </BaseButton>

          <span class="home-view__pagination-info">
            Página {{ currentPage }} de {{ totalPages }}
          </span>

          <BaseButton
            variant="ghost"
            size="sm"
            :disabled="!hasNextPage"
            @click="nextPage"
          >
            Siguiente →
          </BaseButton>
        </nav>
      </div>
    </Transition>
  </main>
</template>
