# Pokédex Educativa — Vue 3

Aplicación de aprendizaje construida con **Vue 3 + Composition API + TypeScript**, usando la [PokeAPI](https://pokeapi.co) como fuente de datos.

## Conceptos de Vue 3 demostrados

| Archivo | Concepto |
|---|---|
| `src/main.ts` | `createApp()` + plugins (Pinia, Router) |
| `src/App.vue` | `provide()` — contexto global, `<RouterView>` + `<Transition>` |
| `src/symbols.ts` | `InjectionKey<T>` — tipado seguro para provide/inject |
| `src/router/index.ts` | Vue Router: rutas, lazy loading, navigation guards, scroll behavior |
| `src/stores/favorites.ts` | Pinia: `defineStore()`, state, computed, actions, persistencia |
| `src/composables/usePokemon.ts` | Composables: `ref`, `computed`, `watch`, fetch, paginación |
| `src/components/ui/BaseCard.vue` | Slots: default, named (`#header`, `#footer`) |
| `src/components/ui/BaseButton.vue` | Props tipadas + Emits |
| `src/components/ui/SearchInput.vue` | `v-model` personalizado (`modelValue` + `update:modelValue`) |
| `src/components/ui/LoadingSpinner.vue` | Lifecycle hooks: `onMounted`, `onUnmounted` |
| `src/components/pokemon/PokemonTypeBadge.vue` | Componente presentacional puro |
| `src/components/pokemon/PokemonStats.vue` | `computed()` para transformaciones complejas |
| `src/components/pokemon/PokemonCard.vue` | Props + Emits + `inject()` |
| `src/components/pokemon/PokemonList.vue` | `<TransitionGroup>` para listas animadas |
| `src/components/layout/AppHeader.vue` | `inject()`, `useRoute()`, `<RouterLink>` |
| `src/views/HomeView.vue` | Vista container: composables + Pinia + `onMounted` |
| `src/views/PokemonDetailView.vue` | `useRoute()`, `toRef()`, `useFavoritesStore()` |
| `src/views/FavoritesView.vue` | `storeToRefs()`, `v-if/v-else`, `<TransitionGroup>` |

---

## Setup

```bash
# Instalar dependencias
pnpm install

# Dev server con hot reload
pnpm dev

# Build de producción
pnpm build
```

---

## Vue DevTools — Setup (RECOMENDADO)

Las Vue DevTools son **fundamentales** para aprender Vue. Te permiten inspeccionar:
- El árbol de componentes con sus props y estado
- El store de Pinia (state, actions ejecutadas)
- El router (historial de rutas)
- El Virtual DOM y los re-renders

### Opción 1: Extensión del browser (recomendada para desarrollo)

1. Instalá la extensión para tu browser:
   - [Chrome / Edge](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

2. Corré la app en modo dev (`pnpm dev`)
3. Abrí DevTools (F12) → verás la pestaña **Vue** (o "⚡ Vue")

### Opción 2: Vite Plugin DevTools (en el browser, sin extensión)

```bash
pnpm add -D vite-plugin-vue-devtools
```

En `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), VueDevTools()],
})
```

Cuando corras `pnpm dev`, verás un botón flotante de DevTools directamente en la app.

### Qué explorar con DevTools

#### Componentes
- Hacé click en cualquier componente del árbol → ves sus props, emits y estado interno
- Buscá `AppHeader` → deberías ver el `theme` inyectado vía `inject()`
- Buscá `PokemonCard` → ves las props `pokemon` e `isFavorite`

#### Pinia
- Pestaña **Pinia** → Store `favorites`
- Podés ver el state en tiempo real, editarlo manualmente, y ver el historial de mutations

#### Router
- Pestaña **Router** → historial de rutas navegadas, params, meta

---

## Arquitectura

```
src/
├── main.ts              # Punto de entrada: app + plugins
├── App.vue              # Root: provide(theme), RouterView + Transition
├── symbols.ts           # InjectionKey tipados
├── router/              # Vue Router config
│   └── index.ts
├── stores/              # Pinia stores
│   └── favorites.ts
├── composables/         # Lógica reutilizable (Composition API)
│   └── usePokemon.ts
├── types/               # Interfaces TypeScript
│   └── pokemon.ts
├── views/               # Páginas/Rutas (Smart Components)
│   ├── HomeView.vue
│   ├── PokemonDetailView.vue
│   └── FavoritesView.vue
└── components/          # Componentes reutilizables
    ├── layout/          # Header, Footer
    ├── ui/              # BaseCard, BaseButton, SearchInput, LoadingSpinner
    └── pokemon/         # PokemonCard, PokemonList, PokemonStats, PokemonTypeBadge
```

---

## Stack

- **Vue 3** — `<script setup>` + Composition API
- **TypeScript** — tipado completo
- **Vue Router 4** — SPA routing
- **Pinia** — state management oficial
- **Vite** — bundler ultrarrápido
- **PokeAPI** — datos gratuitos de Pokémon
