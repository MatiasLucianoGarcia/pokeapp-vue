<!--
  CONCEPTO: Usando el Store de Pinia directamente en una view

  FavoritesView demuestra que el store de Pinia es accesible
  desde cualquier componente sin prop drilling.

  storeToRefs(): convierte las propiedades del store a Refs individuales
  para poder desestructurarlas Y mantener la reactividad.

  SIN storeToRefs():
    const { favoritesList } = store  ←  NO reactivo (destructuring rompe la reactividad)

  CON storeToRefs():
    const { favoritesList } = storeToRefs(store)  ←  SÍ reactivo ✅
-->
<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PokemonTypeBadge from '@/components/pokemon/PokemonTypeBadge.vue'

const router = useRouter()
const favoritesStore = useFavoritesStore()

// storeToRefs: desestructura propiedades como Refs reactivos
const { favoritesList, favoritesCount } = storeToRefs(favoritesStore)

function goToDetail(name: string) {
  router.push({ name: 'pokemon-detail', params: { name } })
}

function removeFavorite(id: number) {
  favoritesStore.removeFavorite(id)
}

function getOfficialArtwork(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

const formattedName = (name: string) =>
  name ? name.charAt(0).toUpperCase() + name.slice(1) : ''
</script>

<template>
  <main class="favorites-view">
    <div class="favorites-view__header">
      <h1 class="favorites-view__title">
        ❤️ Mis Favoritos
        <span class="favorites-view__count">({{ favoritesCount }})</span>
      </h1>
    </div>

    <!-- v-if / v-else: muestra contenido alternativo si no hay favoritos -->
    <div v-if="favoritesCount === 0" class="favorites-view__empty">
      <div class="favorites-view__empty-illustration">😶</div>
      <p class="favorites-view__empty-text">
        Todavía no tenés favoritos.<br />
        Explorá la Pokédex y agremás algunos!
      </p>
      <BaseButton @click="router.push('/')">Ir a la Pokédex</BaseButton>
    </div>

    <TransitionGroup
      v-else
      tag="ul"
      name="pokemon-grid"
      class="favorites-view__grid"
    >
      <li v-for="pokemon in favoritesList" :key="pokemon.id" class="favorites-view__item">
        <BaseCard hoverable class="favorites-view__card" @click="goToDetail(pokemon.name)">
          <template #header>
            <img
              :src="getOfficialArtwork(pokemon.id)"
              :alt="formattedName(pokemon.name)"
              class="favorites-view__img"
              loading="lazy"
            />
          </template>

          <div class="favorites-view__info">
            <span class="favorites-view__id">#{{ String(pokemon.id).padStart(3, '0') }}</span>
            <h3 class="favorites-view__name">{{ formattedName(pokemon.name) }}</h3>

            <div v-if="pokemon.types.length > 0" class="favorites-view__types">
              <PokemonTypeBadge
                v-for="typeInfo in pokemon.types"
                :key="typeInfo.slot"
                :type-name="typeInfo.type.name"
                size="sm"
              />
            </div>
          </div>

          <template #footer>
            <BaseButton
              variant="danger"
              size="sm"
              @click.stop="removeFavorite(pokemon.id)"
            >
              💔 Quitar
            </BaseButton>
          </template>
        </BaseCard>
      </li>
    </TransitionGroup>
  </main>
</template>
