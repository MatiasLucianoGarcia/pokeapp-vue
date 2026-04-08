// ============================================================
// CONCEPTO: Pinia — State Management oficial de Vue 3
//
// defineStore(id, setup) crea un store global.
// El "id" ('favorites') es único y aparece en Vue DevTools.
//
// Pinia usa Composition API internamente:
//   - ref() / reactive() → state
//   - computed()         → getters
//   - function()         → actions
//
// DIFERENCIA CON VUEX: Pinia no tiene mutations separadas.
// Las actions son funciones normales que modifican el state.
//
// PERSISTENCIA: usamos localStorage para que los favoritos
// sobrevivan al recargar la página.
// ============================================================

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Pokemon } from '@/types/pokemon'

const STORAGE_KEY = 'pokedex-favorites'

export const useFavoritesStore = defineStore('favorites', () => {
  // ── STATE ──────────────────────────────────────────────────
  // ref() es el equivalente a data() en Options API.
  // Inicializamos desde localStorage para persistencia.
  const favorites = ref<Map<number, Pokemon>>(loadFromStorage())

  // ── GETTERS ────────────────────────────────────────────────
  // computed() se recalcula automáticamente cuando 'favorites' cambia.
  const favoritesList = computed<Pokemon[]>(() =>
    Array.from(favorites.value.values()),
  )

  const favoritesCount = computed<number>(() => favorites.value.size)

  // ── ACTIONS ────────────────────────────────────────────────
  function addFavorite(pokemon: Pokemon): void {
    favorites.value.set(pokemon.id, pokemon)
  }

  function removeFavorite(pokemonId: number): void {
    favorites.value.delete(pokemonId)
  }

  function toggleFavorite(pokemon: Pokemon): void {
    if (isFavorite(pokemon.id)) {
      removeFavorite(pokemon.id)
    } else {
      addFavorite(pokemon)
    }
  }

  function isFavorite(pokemonId: number): boolean {
    return favorites.value.has(pokemonId)
  }

  // ── PERSISTENCIA ───────────────────────────────────────────
  // watch() observa 'favorites' y sincroniza con localStorage.
  // { deep: true } es necesario para detectar cambios dentro del Map.
  watch(
    favorites,
    (newFavorites) => {
      const arr = Array.from(newFavorites.values())
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
    },
    { deep: true },
  )

  return {
    favorites,
    favoritesList,
    favoritesCount,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  }
})

// Helper privado: lee y deserializa desde localStorage
function loadFromStorage(): Map<number, Pokemon> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Map()
    const arr = JSON.parse(raw) as Pokemon[]
    return new Map(arr.map((p) => [p.id, p]))
  } catch {
    return new Map()
  }
}
