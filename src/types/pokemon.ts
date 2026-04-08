// ============================================================
// CONCEPTO: TypeScript con Vue 3
// Las interfaces definen el contrato de datos que viene de la API.
// Vue 3 + TypeScript trabajan de la mano: props, emits, refs
// todos son tipados cuando usás estas interfaces.
// ============================================================

export interface PokemonListItem {
  name: string
  url: string
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListItem[]
}

export interface PokemonStat {
  base_stat: number
  stat: {
    name: string
  }
}

export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonSprites {
  front_default: string | null
  other: {
    'official-artwork': {
      front_default: string | null
    }
    dream_world: {
      front_default: string | null
    }
  }
}

export interface PokemonAbility {
  ability: {
    name: string
  }
  is_hidden: boolean
}

export interface Pokemon {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  sprites: PokemonSprites
  stats: PokemonStat[]
  types: PokemonType[]
  abilities: PokemonAbility[]
}

// Tipo utilitario: ID extraído de la URL de la lista
export type PokemonId = number

// Helper para extraer el ID desde la URL de la PokeAPI
// Ej: "https://pokeapi.co/api/v2/pokemon/25/" → 25
export function extractIdFromUrl(url: string): PokemonId {
  const parts = url.split('/').filter(Boolean)
  return parseInt(parts[parts.length - 1], 10)
}

// Helpers de formato
export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
}
