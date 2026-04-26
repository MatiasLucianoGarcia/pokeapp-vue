<!--
  CONCEPTO: HomeView — actualizada con:

  1. useTemplateRef() — Vue 3.5+
     Versión moderna y explícita de los template refs.
     vs el enfoque antiguo: const ref = ref(null) + <Component ref="ref">
     El nuevo: const ref = useTemplateRef('name') + <Component ref="name">
     TypeScript sabe exactamente el tipo gracias al generic.

  2. onActivated / onDeactivated — lifecycle de KeepAlive
     Cuando HomeView está dentro de <KeepAlive>:
     - onMounted:     corre 1 sola vez (primera vez)
     - onActivated:   corre cada vez que volvés a esta vista
     - onDeactivated: corre cuando salís de esta vista
     - onUnmounted:   corre solo si el KeepAlive se destruye
     Si NO usás KeepAlive, onActivated/onDeactivated nunca corren.

  3. defineOptions({ name: 'HomeView' })
     <KeepAlive :include="['HomeView']"> necesita el nombre del componente.
     Con <script setup>, Vite infiere el nombre del filename, pero
     defineOptions() lo hace EXPLÍCITO y más robusto.
-->
<script setup lang="ts">
import { computed, onMounted, onActivated, onDeactivated, useTemplateRef } from 'vue'
import { usePokemonList } from '@/composables/usePokemon'
import { useFavoritesStore } from '@/stores/favorites'
import PokemonList from '@/components/pokemon/PokemonList.vue'
import PokemonTypeFilter from '@/components/pokemon/PokemonTypeFilter.vue'
import PokemonQuickModal from '@/components/pokemon/PokemonQuickModal.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

// Define el nombre del componente explícitamente (necesario para KeepAlive :include)
defineOptions({ name: 'HomeView' })

const {
  isLoadingList,
  isLoadingType,
  error,
  searchQuery,
  selectedType,
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

const favoritesStore = useFavoritesStore()

// useTemplateRef('modal'): Vue 3.5+ — más explícito que const x = ref(null)
// El generic InstanceType<typeof PokemonQuickModal> da tipado correcto:
// modalRef.value?.open → TypeScript sabe que open(name: string) existe
// porque PokemonQuickModal lo expuso con defineExpose()
const modalRef = useTemplateRef<InstanceType<typeof PokemonQuickModal>>('modal')

// onMounted: corre UNA SOLA VEZ cuando el componente se monta por primera vez.
// Con KeepAlive, la segunda vez que llegás a esta ruta NO corre onMounted.
onMounted(() => {
  console.log('[HomeView] onMounted — carga inicial')
  fetchAllPokemon()
})

// onActivated: corre cada vez que el componente se activa (volvés a esta ruta).
// Reemplaza el rol de onMounted para actualizaciones periódicas en KeepAlive.
onActivated(() => {
  console.log('[HomeView] onActivated — volviste a esta vista (estado preservado)')
})

// onDeactivated: corre cuando salís de la vista (componente "dormido" en KeepAlive).
onDeactivated(() => {
  console.log('[HomeView] onDeactivated — saliste de la vista (estado guardado)')
})

const favoriteIds = computed<Set<number>>(
  () => new Set(favoritesStore.favoritesList.map((p) => p.id)),
)

// Abre el modal pasándole el nombre del pokémon
// modalRef.value?.open() — el ?. es safe porque el modal puede no estar montado
function handleQuickView(pokemonName: string) {
  modalRef.value?.open(pokemonName)
}

function handleToggleFavorite(pokemonId: number) {
  const pokemon = favoritesStore.favoritesList.find((p) => p.id === pokemonId)
  if (pokemon) {
    favoritesStore.toggleFavorite(pokemon)
  } else {
    favoritesStore.toggleFavorite({
      id: pokemonId,
      name: paginatedPokemon.value.find(p => {
        const parts = p.url.split('/').filter(Boolean)
        return parseInt(parts[parts.length - 1]) === pokemonId
      })?.name ?? '',
      height: 0, weight: 0, base_experience: 0,
      sprites: { front_default: null, other: { 'official-artwork': { front_default: null }, dream_world: { front_default: null } } },
      stats: [], types: [], abilities: []
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
      <SearchInput v-model="searchQuery" placeholder="Buscar por nombre..." label="Buscar Pokémon" />
    </div>

    <!-- Filtro por tipo: demuestra watchEffect en el composable -->
    <PokemonTypeFilter
      :selected-type="selectedType"
      :is-loading="isLoadingType"
      @select-type="selectedType = $event"
    />

    <Transition name="fade" mode="out-in">
      <LoadingSpinner v-if="isLoadingList || isLoadingType" message="Cargando Pokémon" />

      <div v-else-if="error" class="home-view__error">
        <p>❌ {{ error }}</p>
        <BaseButton @click="fetchAllPokemon">Reintentar</BaseButton>
      </div>

      <div v-else class="home-view__content">
        <PokemonList
          :pokemon-list="paginatedPokemon"
          :favorites-ids="favoriteIds"
          @toggle-favorite="handleToggleFavorite"
          @quick-view="handleQuickView"
        />

        <nav v-if="totalPages > 1" class="home-view__pagination">
          <BaseButton variant="ghost" size="sm" :disabled="!hasPrevPage" @click="prevPage">
            ← Anterior
          </BaseButton>
          <span class="home-view__pagination-info">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          <BaseButton variant="ghost" size="sm" :disabled="!hasNextPage" @click="nextPage">
            Siguiente →
          </BaseButton>
        </nav>
      </div>
    </Transition>

    <!--
      ref="modal" → useTemplateRef('modal') en el script
      El componente está aquí en el árbol lógico de Vue,
      pero su DOM va al <body> gracias a <Teleport>
    -->
    <PokemonQuickModal ref="modal" />
  </main>
</template>
