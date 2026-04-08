// ============================================================
// CONCEPTO: Composables — El corazón de la Composition API
//
// Un composable es una función que ENCAPSULA lógica stateful
// y la hace reutilizable entre componentes.
//
// Convención de nombre: siempre empieza con "use" (usePokemon, useAuth, etc.)
//
// ANTES (Options API): mixins → problemáticos, conflictos de nombres.
// AHORA (Composition API): composables → explícitos, tipados, testeables.
//
// Este composable maneja TODO lo relacionado a la PokeAPI:
//   - Paginación
//   - Búsqueda con debounce
//   - Fetch individual de pokémon
// ============================================================

import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import type {
  Pokemon,
  PokemonListItem,
  PokemonListResponse,
} from '@/types/pokemon'
import { extractIdFromUrl } from '@/types/pokemon'

const BASE_URL = 'https://pokeapi.co/api/v2'
const PAGE_SIZE = 20

// ── usePokemonList ─────────────────────────────────────────────
// Composable para la lista paginada + búsqueda
export function usePokemonList() {
  // State interno del composable
  const allPokemon = ref<PokemonListItem[]>([]) // cache de TODOS los pokémon
  const isLoadingList = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const currentPage = ref(1)
  const totalCount = ref(0)

  // computed: filtra la lista según la búsqueda
  // Este computed se recalcula automáticamente cuando searchQuery o allPokemon cambia
  const filteredPokemon = computed<PokemonListItem[]>(() => {
    if (!searchQuery.value.trim()) {
      return allPokemon.value
    }
    const q = searchQuery.value.toLowerCase().trim()
    return allPokemon.value.filter((p) => p.name.includes(q))
  })

  // computed: paginación sobre los resultados filtrados
  const paginatedPokemon = computed<PokemonListItem[]>(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return filteredPokemon.value.slice(start, end)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredPokemon.value.length / PAGE_SIZE),
  )

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  // watch: cuando el usuario busca, vuelve a la página 1
  // Esta es la razón de usar watch: reaccionar a cambios de state
  watch(searchQuery, () => {
    currentPage.value = 1
  })

  // Carga todos los Pokémon de una sola vez (la API tiene ~1300)
  // Los almacenamos en memoria para que la búsqueda sea instantánea
  async function fetchAllPokemon(): Promise<void> {
    if (allPokemon.value.length > 0) return // ya están cargados (cache)
    isLoadingList.value = true
    error.value = null
    try {
      const res = await fetch(`${BASE_URL}/pokemon?limit=2000&offset=0`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: PokemonListResponse = await res.json()
      allPokemon.value = data.results
      totalCount.value = data.count
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
    } finally {
      isLoadingList.value = false
    }
  }

  function nextPage(): void {
    if (hasNextPage.value) currentPage.value++
  }

  function prevPage(): void {
    if (hasPrevPage.value) currentPage.value--
  }

  function goToPage(page: number): void {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    // State
    isLoadingList,
    error,
    searchQuery,
    currentPage,
    totalCount,
    // Computed
    filteredPokemon,
    paginatedPokemon,
    totalPages,
    hasNextPage,
    hasPrevPage,
    // Actions
    fetchAllPokemon,
    nextPage,
    prevPage,
    goToPage,
  }
}

// ── usePokemonDetail ───────────────────────────────────────────
// Composable para cargar el detalle de un Pokémon individual.
// Acepta un 'name' reactivo (Ref<string>) para poder re-fetchear
// automáticamente si el nombre cambia.
export function usePokemonDetail(name: Ref<string>) {
  const pokemon = ref<Pokemon | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPokemon(pokemonName: string): Promise<void> {
    if (!pokemonName) return
    isLoading.value = true
    error.value = null
    pokemon.value = null
    try {
      const res = await fetch(
        `${BASE_URL}/pokemon/${pokemonName.toLowerCase()}`,
      )
      if (!res.ok) throw new Error(`Pokémon "${pokemonName}" no encontrado`)
      pokemon.value = await res.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
    } finally {
      isLoading.value = false
    }
  }

  // watch el nombre recibido: si cambia, re-fetchea automáticamente
  // { immediate: true } ejecuta el watch inmediatamente al montar
  watch(name, (newName) => fetchPokemon(newName), { immediate: true })

  return { pokemon, isLoading, error }
}

// Helper exportado: dado un item de lista, extrae su ID
export { extractIdFromUrl }
