// ============================================================
// CONCEPTO: Composables — El corazón de la Composition API
//
// ACTUALIZACIÓN: ahora demuestra también:
//   - watchEffect() vs watch() — diferencia clave de Vue 3
//   - Filtro por tipo con fetch a la PokeAPI
// ============================================================

import { ref, computed, watch, watchEffect } from 'vue'
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
export function usePokemonList() {
  const allPokemon = ref<PokemonListItem[]>([])
  const isLoadingList = ref(false)
  const isLoadingType = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedType = ref<string | null>(null)
  const currentPage = ref(1)
  const totalCount = ref(0)

  // Cache de nombres de pokémon por tipo (evita re-fetches)
  const pokemonNamesForType = ref<Set<string>>(new Set())

  // ──────────────────────────────────────────────────────────────
  // watch vs watchEffect — ESTA ES LA DIFERENCIA CLAVE:
  //
  // watch(source, callback):
  //   ✅ Declarás EXPLÍCITAMENTE qué observar
  //   ✅ Recibís valor anterior y nuevo (oldVal, newVal)
  //   ✅ Control preciso: no corre en mount a menos que { immediate: true }
  //   ✅ Ideal para efectos ASÍNCRONOS (fetch, etc.)
  //   ❌ Tenés que listar todas las dependencias
  //
  // watchEffect(callback):
  //   ✅ Auto-detecta dependencias leyendo refs en el cuerpo
  //   ✅ Corre INMEDIATAMENTE al montar (sin immediate: true)
  //   ✅ Ideal para efectos SÍNCRONOS con múltiples dependencias
  //   ❌ No recibís valor anterior
  //   ❌ Menos control sobre cuándo corre
  // ──────────────────────────────────────────────────────────────

  // CASO watchEffect: resetear página cuando CUALQUIER filtro cambia.
  // Vue auto-detecta que dependemos de searchQuery.value Y selectedType.value
  // SIN que tengamos que declararlos. Si agregásemos otro filtro mañana,
  // solo necesitamos leer su .value y watchEffect lo trackea automático.
  watchEffect(() => {
    // Leer los valores crea la dependencia (Vue trackea esto internamente)
    const _q = searchQuery.value
    const _t = selectedType.value
    void _q; void _t // evitar lint de "unused variable"
    currentPage.value = 1
  })

  // CASO watch: para el fetch del tipo es MEJOR watch que watchEffect porque:
  //   1. Es una operación ASÍNCRONA
  //   2. Necesitamos el valor ANTERIOR para posible cancelación
  //   3. Queremos control sobre no correr en mount (no immediate)
  watch(selectedType, async (newType) => {
    if (!newType) {
      pokemonNamesForType.value = new Set()
      return
    }
    isLoadingType.value = true
    try {
      const res = await fetch(`${BASE_URL}/type/${newType}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      // La API devuelve { pokemon: [{ pokemon: { name, url } }] }
      pokemonNamesForType.value = new Set<string>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.pokemon.map((entry: any) => entry.pokemon.name as string),
      )
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error de tipo'
    } finally {
      isLoadingType.value = false
    }
  })

  // computed: filtra por tipo Y búsqueda (ambos filtros activos simultáneamente)
  const filteredPokemon = computed<PokemonListItem[]>(() => {
    let result = allPokemon.value

    // Filtro por tipo: intersecta con el Set de nombres del tipo
    if (selectedType.value && pokemonNamesForType.value.size > 0) {
      result = result.filter((p) => pokemonNamesForType.value.has(p.name))
    }

    // Filtro por búsqueda de texto
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      result = result.filter((p) => p.name.includes(q))
    }

    return result
  })

  const paginatedPokemon = computed<PokemonListItem[]>(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredPokemon.value.slice(start, start + PAGE_SIZE)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredPokemon.value.length / PAGE_SIZE),
  )

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  async function fetchAllPokemon(): Promise<void> {
    if (allPokemon.value.length > 0) return
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
    if (page >= 1 && page <= totalPages.value) currentPage.value = page
  }

  return {
    isLoadingList,
    isLoadingType,
    error,
    searchQuery,
    selectedType,
    currentPage,
    totalCount,
    filteredPokemon,
    paginatedPokemon,
    totalPages,
    hasNextPage,
    hasPrevPage,
    fetchAllPokemon,
    nextPage,
    prevPage,
    goToPage,
  }
}

// ── usePokemonDetail ───────────────────────────────────────────
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

  watch(name, (newName) => fetchPokemon(newName), { immediate: true })

  return { pokemon, isLoading, error }
}

export { extractIdFromUrl }
