<!--
  CONCEPTO: useRoute() para leer parámetros de URL + watch reactivo

  useRoute() retorna la ruta actual como objeto reactivo.
  route.params.name cambia cuando el usuario navega entre Pokémon.

  El composable usePokemonDetail() recibe un Ref<string> y reacciona
  automáticamente: cuando el nombre cambia, re-fetchea el pokémon.

  TAMBIÉN DEMUESTRA:
    - toRef(route.params, 'name'): convierte un campo de un reactive a Ref
    - Async component: PokemonStats se importa dinámicamente para demostrar
      code splitting (en una app real lo harías para componentes grandes)
    - useFavoritesStore() para toggle favorito con datos completos
-->
<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePokemonDetail } from '@/composables/usePokemon'
import { useFavoritesStore } from '@/stores/favorites'
import PokemonTypeBadge from '@/components/pokemon/PokemonTypeBadge.vue'
import PokemonStats from '@/components/pokemon/PokemonStats.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { TYPE_COLORS } from '@/types/pokemon'

const route = useRoute()
const router = useRouter()

// toRef convierte route.params.name (string | string[]) a Ref<string>
// Esto permite que usePokemonDetail lo observe reactivamente
const pokemonName = toRef(route.params, 'name') as ReturnType<typeof toRef<string>>

// El composable recibe el Ref y hace watch interno
const { pokemon, isLoading, error } = usePokemonDetail(pokemonName as any)

const favoritesStore = useFavoritesStore()

const isFavorite = computed(() =>
  pokemon.value ? favoritesStore.isFavorite(pokemon.value.id) : false,
)

// Imagen oficial de alta resolución
const officialArtwork = computed(
  () =>
    pokemon.value?.sprites.other['official-artwork'].front_default ??
    pokemon.value?.sprites.front_default ??
    '',
)

// Color de fondo basado en el tipo principal
const mainTypeColor = computed(() => {
  const firstType = pokemon.value?.types[0]?.type.name
  return firstType ? TYPE_COLORS[firstType] : '#6366f1'
})

// Nombre formateado
const formattedName = computed(() => {
  const name = pokemon.value?.name ?? ''
  return name.charAt(0).toUpperCase() + name.slice(1)
})

function toggleFavorite() {
  if (pokemon.value) {
    favoritesStore.toggleFavorite(pokemon.value)
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <main class="detail-view">
    <BaseButton variant="ghost" class="detail-view__back" @click="goBack">
      ← Volver
    </BaseButton>

    <Transition name="fade" mode="out-in">
      <LoadingSpinner v-if="isLoading" message="Cargando Pokémon" />

      <div v-else-if="error" class="detail-view__error">
        <p>❌ {{ error }}</p>
        <BaseButton @click="goBack">Volver al inicio</BaseButton>
      </div>

      <article v-else-if="pokemon" class="detail-view__content">
        <!-- Hero section con color dinámico del tipo -->
        <div
          class="detail-view__hero"
          :style="{ '--type-color': mainTypeColor }"
        >
          <div class="detail-view__hero-info">
            <span class="detail-view__number">
              #{{ String(pokemon.id).padStart(3, '0') }}
            </span>
            <h1 class="detail-view__name">{{ formattedName }}</h1>
            <div class="detail-view__types">
              <PokemonTypeBadge
                v-for="typeInfo in pokemon.types"
                :key="typeInfo.slot"
                :type-name="typeInfo.type.name"
                size="md"
              />
            </div>
          </div>

          <div class="detail-view__hero-img">
            <img
              :src="officialArtwork"
              :alt="formattedName"
              class="detail-view__img"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-view__actions">
          <BaseButton
            :variant="isFavorite ? 'danger' : 'primary'"
            @click="toggleFavorite"
          >
            {{ isFavorite ? '💔 Quitar de favoritos' : '❤️ Agregar a favoritos' }}
          </BaseButton>
        </div>

        <!-- Info grid -->
        <div class="detail-view__info-grid">
          <div class="detail-view__info-card">
            <h2 class="detail-view__section-title">Información</h2>
            <dl class="detail-view__data-list">
              <div class="detail-view__data-row">
                <dt>Altura</dt>
                <dd>{{ (pokemon.height / 10).toFixed(1) }} m</dd>
              </div>
              <div class="detail-view__data-row">
                <dt>Peso</dt>
                <dd>{{ (pokemon.weight / 10).toFixed(1) }} kg</dd>
              </div>
              <div class="detail-view__data-row">
                <dt>Exp. base</dt>
                <dd>{{ pokemon.base_experience }}</dd>
              </div>
            </dl>
          </div>

          <div class="detail-view__info-card">
            <h2 class="detail-view__section-title">Habilidades</h2>
            <ul class="detail-view__abilities">
              <li
                v-for="abilityInfo in pokemon.abilities"
                :key="abilityInfo.ability.name"
                class="detail-view__ability"
                :class="{ 'detail-view__ability--hidden': abilityInfo.is_hidden }"
              >
                {{ abilityInfo.ability.name }}
                <span v-if="abilityInfo.is_hidden" class="detail-view__hidden-tag">
                  Oculta
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Stats: componente con computed internos -->
        <PokemonStats :stats="pokemon.stats" />
      </article>
    </Transition>
  </main>
</template>
