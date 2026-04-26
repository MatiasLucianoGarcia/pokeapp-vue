<!--
  CONCEPTO: <Teleport> + defineExpose

  ── <Teleport> ────────────────────────────────────────────────
  Renderiza este componente en un nodo del DOM FUERA del árbol
  de componentes Vue. Con to="body", el modal va directo al <body>.

  ¿Por qué importa?
  Sin Teleport, el modal vive dentro de un contenedor que puede
  tener overflow:hidden o z-index bajo → modal se recorta o queda
  detrás de otros elementos. Teleport lo saca de ese contexto.

  ── defineExpose ───────────────────────────────────────────────
  En <script setup>, el componente está CERRADO por defecto.
  El padre NO puede acceder a nada desde $refs/useTemplateRef
  a menos que se lo indiqués explícitamente con defineExpose().

  Options API:     todo era público automáticamente (problema)
  Composition API: nada es público por defecto (correcto) + defineExpose

  El padre llama: modalRef.value?.open('pikachu')
  Esto solo funciona porque exponemos 'open' y 'close'.
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePokemonDetail } from '@/composables/usePokemon'
import { useFavoritesStore } from '@/stores/favorites'
import PokemonTypeBadge from './PokemonTypeBadge.vue'
import PokemonStats from './PokemonStats.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { TYPE_COLORS } from '@/types/pokemon'

const router = useRouter()
const favoritesStore = useFavoritesStore()

// Estado interno: visible + nombre del pokémon a mostrar
const isVisible = ref(false)
const pokemonName = ref('')

// Reutilizamos el composable: cuando pokemonName cambia, re-fetchea
const { pokemon, isLoading, error } = usePokemonDetail(pokemonName)

const isFavorite = ref(false)

// Sincroniza isFavorite con el store cuando el pokémon carga
watch(pokemon, (p) => {
  if (p) isFavorite.value = favoritesStore.isFavorite(p.id)
})

// ── API pública expuesta al padre ──────────────────────────────
// Sin defineExpose, estas funciones serían INACCESIBLES desde fuera
function open(name: string) {
  pokemonName.value = name
  isVisible.value = true
  // Previene scroll del body mientras el modal está abierto
  document.body.style.overflow = 'hidden'
}

function close() {
  isVisible.value = false
  document.body.style.overflow = ''
}

// defineExpose: el padre puede llamar .open() y .close() vía template ref
defineExpose({ open, close })

// ─────────────────────────────────────────────────────────────

function goToDetail() {
  close()
  router.push({ name: 'pokemon-detail', params: { name: pokemonName.value } })
}

function toggleFavorite() {
  if (!pokemon.value) return
  favoritesStore.toggleFavorite(pokemon.value)
  isFavorite.value = !isFavorite.value
}

function handleBackdropClick(event: MouseEvent) {
  // Cierra solo si click fue en el backdrop (no en el contenido)
  if (event.target === event.currentTarget) close()
}

function getOfficialArtwork(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

const mainTypeColor = (typeName: string) => TYPE_COLORS[typeName] ?? '#6366f1'
</script>

<template>
  <!--
    <Teleport to="body">: Vue renderiza este template directamente
    como hijo del <body>, no donde está el componente en el árbol.
    El componente sigue siendo parte del árbol lógico de Vue
    (accede al router, Pinia, etc.) pero el DOM va al body.
  -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isVisible"
        class="quick-modal__backdrop"
        role="dialog"
        aria-modal="true"
        @click="handleBackdropClick"
      >
        <div class="quick-modal__panel">
          <!-- Header -->
          <div
            class="quick-modal__hero"
            :style="{
              '--type-color': pokemon?.types[0]
                ? mainTypeColor(pokemon.types[0].type.name)
                : '#6366f1',
            }"
          >
            <button class="quick-modal__close" aria-label="Cerrar" @click="close">
              ✕
            </button>

            <LoadingSpinner v-if="isLoading" size="sm" message="Cargando..." />

            <template v-else-if="pokemon">
              <img
                :src="getOfficialArtwork(pokemon.id)"
                :alt="pokemon.name"
                class="quick-modal__img"
              />
              <div class="quick-modal__info">
                <span class="quick-modal__number">
                  #{{ String(pokemon.id).padStart(3, '0') }}
                </span>
                <h2 class="quick-modal__name">
                  {{ pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) }}
                </h2>
                <div class="quick-modal__types">
                  <PokemonTypeBadge
                    v-for="t in pokemon.types"
                    :key="t.slot"
                    :type-name="t.type.name"
                  />
                </div>
              </div>
            </template>
          </div>

          <!-- Body -->
          <div v-if="pokemon && !isLoading" class="quick-modal__body">
            <div class="quick-modal__meta">
              <div class="quick-modal__meta-item">
                <span class="quick-modal__meta-label">Altura</span>
                <span class="quick-modal__meta-value">{{ (pokemon.height / 10).toFixed(1) }} m</span>
              </div>
              <div class="quick-modal__meta-item">
                <span class="quick-modal__meta-label">Peso</span>
                <span class="quick-modal__meta-value">{{ (pokemon.weight / 10).toFixed(1) }} kg</span>
              </div>
              <div class="quick-modal__meta-item">
                <span class="quick-modal__meta-label">Exp. base</span>
                <span class="quick-modal__meta-value">{{ pokemon.base_experience }}</span>
              </div>
            </div>

            <PokemonStats :stats="pokemon.stats" />
          </div>

          <div v-if="error" class="quick-modal__error">❌ {{ error }}</div>

          <!-- Footer con acciones -->
          <div v-if="pokemon && !isLoading" class="quick-modal__footer">
            <BaseButton
              :variant="isFavorite ? 'danger' : 'secondary'"
              size="sm"
              @click="toggleFavorite"
            >
              {{ isFavorite ? '💔 Quitar' : '❤️ Favorito' }}
            </BaseButton>
            <BaseButton variant="primary" size="sm" @click="goToDetail">
              Ver detalles →
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
