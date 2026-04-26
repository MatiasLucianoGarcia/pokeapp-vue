<!--
  CONCEPTO: v-model — El binding bidireccional de Vue

  v-model es SYNTACTIC SUGAR que combina:
    :value="campo"  +  @input="campo = $event.target.value"

  Equivalente Angular:
    [(ngModel)]="campo"  ó  [formControl]="control"

  ┌──────────────────────────────────────────────────────────┐
  │ TIPOS DE v-model QUE SE USAN EN ESTA VISTA               │
  ├──────────────────────────────────────────────────────────┤
  │ <input type="text">     → v-model="campo"                │
  │ <input type="email">    → v-model="campo"                │
  │ <input type="number">   → v-model.number="campo"         │
  │ <textarea>              → v-model.lazy="campo"           │
  │ <select>                → v-model="campo"                │
  │ <input type="radio">    → v-model="campo"                │
  │ <input type="checkbox"> → v-model="campo" (boolean)      │
  └──────────────────────────────────────────────────────────┘

  MODIFICADORES de v-model:
    .trim   → quita espacios al inicio y fin automáticamente
    .number → convierte el string del input a Number
    .lazy   → actualiza en 'change' (al salir del campo),
              no en 'input' (en cada tecla). Útil para textarea
              o campos donde no querés validar mientras escriben.

  SUBMIT: @submit.prevent
    → equivale a event.preventDefault() en el handler.
    → sin esto, el form haría una request GET/POST real al servidor.
-->
<script setup lang="ts">
import { useFeedbackForm } from '@/composables/useFeedbackForm'
import BaseButton from '@/components/ui/BaseButton.vue'

const {
  form,
  errors,
  isValid,
  submitted,
  isSubmitting,
  submitForm,
  resetForm,
} = useFeedbackForm()

const CATEGORIES = [
  { value: 'sugerencia', label: '💡 Sugerencia' },
  { value: 'error', label: '🐛 Reporte de error' },
  { value: 'consulta', label: '❓ Consulta' },
]

const PRIORITIES = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
]
</script>

<template>
  <main class="feedback-view">
    <div class="feedback-view__container">
      <h1 class="feedback-view__title">Sugerencias y Reportes</h1>
      <p class="feedback-view__subtitle">
        ¿Encontraste un error? ¿Querés sugerir algo? Completá el formulario.
      </p>

      <!-- ──────────────────────────────────────────────────────
        ESTADO DE ÉXITO: v-if reemplaza todo el form con
        un mensaje de confirmación. El componente está en el
        mismo DOM pero Vue mueve entre los dos bloques.
      ────────────────────────────────────────────────────── -->
      <div v-if="submitted" class="feedback-view__success">
        <p class="feedback-view__success-icon">✅</p>
        <h2>¡Gracias por tu sugerencia!</h2>
        <p>Tu mensaje fue recibido correctamente.</p>
        <BaseButton @click="resetForm">Enviar otra sugerencia</BaseButton>
      </div>

      <!-- ──────────────────────────────────────────────────────
        @submit.prevent: intercepta el submit y llama submitForm().
        Sin .prevent, el browser haría un GET/POST real.
      ────────────────────────────────────────────────────── -->
      <form v-else class="feedback-form" @submit.prevent="submitForm">

        <!-- ── TEXTO con .trim ─────────────────────────────── -->
        <!--
          v-model.trim: Vue quita los espacios al inicio/fin
          AUTOMÁTICAMENTE. No necesitás hacer form.name.trim()
          en el submit — ya llega limpio.
        -->
        <div class="feedback-form__field">
          <label class="feedback-form__label" for="pokemon-name">
            Pokémon relacionado <span class="feedback-form__required">*</span>
          </label>
          <input
            id="pokemon-name"
            v-model.trim="form.pokemonName"
            class="feedback-form__input"
            :class="{ 'feedback-form__input--error': errors.pokemonName }"
            type="text"
            placeholder="Ej: pikachu"
            autocomplete="off"
          />
          <span v-if="errors.pokemonName" class="feedback-form__error">
            {{ errors.pokemonName }}
          </span>
        </div>

        <!-- ── EMAIL (sin modificador) ─────────────────────── -->
        <!--
          v-model en email funciona exactamente igual que en text.
          Vue no valida el formato — eso lo hacemos nosotros
          con el computed 'errors'.
        -->
        <div class="feedback-form__field">
          <label class="feedback-form__label" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            class="feedback-form__input"
            :class="{ 'feedback-form__input--error': errors.email }"
            type="email"
            placeholder="tu@email.com"
          />
          <span v-if="errors.email" class="feedback-form__error">
            {{ errors.email }}
          </span>
        </div>

        <!-- ── SELECT ──────────────────────────────────────── -->
        <!--
          v-model en <select> bindea al VALUE de la opción seleccionada.
          Cuando el usuario cambia la selección, form.category
          se actualiza automáticamente con el value de la opción.
        -->
        <div class="feedback-form__field">
          <label class="feedback-form__label" for="category">
            Categoría <span class="feedback-form__required">*</span>
          </label>
          <select
            id="category"
            v-model="form.category"
            class="feedback-form__select"
            :class="{ 'feedback-form__input--error': errors.category }"
          >
            <option value="" disabled>Seleccioná una categoría...</option>
            <option
              v-for="cat in CATEGORIES"
              :key="cat.value"
              :value="cat.value"
            >
              {{ cat.label }}
            </option>
          </select>
          <span v-if="errors.category" class="feedback-form__error">
            {{ errors.category }}
          </span>
        </div>

        <!-- ── RADIO BUTTONS ───────────────────────────────── -->
        <!--
          v-model en radio: todos los inputs del grupo comparten
          el MISMO v-model ("form.priority"). Vue actualiza
          form.priority con el value del radio seleccionado.

          Angular equivalente: radio con [(ngModel)] o FormControl.
        -->
        <div class="feedback-form__field">
          <span class="feedback-form__label">Prioridad</span>
          <div class="feedback-form__radio-group">
            <label
              v-for="p in PRIORITIES"
              :key="p.value"
              class="feedback-form__radio-label"
              :class="{ 'feedback-form__radio-label--active': form.priority === p.value }"
            >
              <input
                v-model="form.priority"
                type="radio"
                :value="p.value"
                class="feedback-form__radio"
              />
              {{ p.label }}
            </label>
          </div>
        </div>

        <!-- ── NUMBER con .number ─────────────────────────── -->
        <!--
          Problema: los inputs SIEMPRE devuelven strings, incluso
          si son type="number". event.target.value es "5", no 5.

          v-model.number: Vue convierte el string a Number
          AUTOMÁTICAMENTE. form.rating ya es un número real.

          Sin .number: form.rating sería "5" (string) y harías
          parseInt() o Number() en cada lugar donde lo usés.
        -->
        <div class="feedback-form__field">
          <label class="feedback-form__label" for="rating">
            Puntuación: <strong>{{ form.rating }}/10</strong>
          </label>
          <input
            id="rating"
            v-model.number="form.rating"
            class="feedback-form__input"
            type="range"
            min="1"
            max="10"
            step="1"
          />
        </div>

        <!-- ── TEXTAREA con .lazy ─────────────────────────── -->
        <!--
          v-model.lazy: en vez de actualizar en cada tecla (evento 'input'),
          actualiza cuando el usuario SALE del campo (evento 'change').

          Cuándo usarlo:
            ✅ Campos largos (descripción, comentario) donde no querés
               validar en cada letra — sería molesto para el usuario.
            ✅ Cuando el update es costoso (búsqueda, computación pesada).
            ❌ NO para búsquedas en tiempo real (ahí querés 'input').
        -->
        <div class="feedback-form__field">
          <label class="feedback-form__label" for="description">
            Descripción
          </label>
          <textarea
            id="description"
            v-model.lazy="form.description"
            class="feedback-form__textarea"
            :class="{ 'feedback-form__input--error': errors.description }"
            placeholder="Describí el problema o sugerencia... (mín. 10 caracteres si completás este campo)"
            rows="4"
          />
          <div class="feedback-form__field-footer">
            <span v-if="errors.description" class="feedback-form__error">
              {{ errors.description }}
            </span>
            <span class="feedback-form__hint">
              {{ form.description.trim().length }} caracteres
            </span>
          </div>
        </div>

        <!-- ── CHECKBOX ────────────────────────────────────── -->
        <!--
          v-model en checkbox: bindea a un boolean.
          true = checked, false = unchecked.

          Si querés bindear a un array (múltiples checkboxes),
          v-model bindea automáticamente al array cuando el
          mismo v-model se usa en varios checkboxes.
        -->
        <div class="feedback-form__field feedback-form__field--row">
          <input
            id="terms"
            v-model="form.acceptTerms"
            type="checkbox"
            class="feedback-form__checkbox"
          />
          <label for="terms" class="feedback-form__checkbox-label">
            Acepto que mis datos sean usados para mejorar la Pokédex
            <span class="feedback-form__required">*</span>
          </label>
        </div>
        <span v-if="errors.acceptTerms" class="feedback-form__error feedback-form__error--standalone">
          {{ errors.acceptTerms }}
        </span>

        <!-- ── SUBMIT ──────────────────────────────────────── -->
        <!--
          :disabled="!isValid || isSubmitting"
            → el botón está deshabilitado si el form no es válido
              o si ya está procesando la request.

          El computed 'isValid' se recalcula con cada cambio del form,
          así el botón se habilita/deshabilita reactivamente sin
          ningún addEventListener manual.
        -->
        <div class="feedback-form__actions">
          <BaseButton
            type="submit"
            :disabled="!isValid || isSubmitting"
          >
            {{ isSubmitting ? 'Enviando...' : 'Enviar sugerencia' }}
          </BaseButton>

          <BaseButton
            type="button"
            variant="ghost"
            @click="resetForm"
          >
            Limpiar formulario
          </BaseButton>
        </div>

        <!-- Vista previa del estado del form (solo para aprendizaje) -->
        <details class="feedback-form__debug">
          <summary>Ver estado del formulario (debug)</summary>
          <pre>{{ JSON.stringify(form, null, 2) }}</pre>
          <pre>isValid: {{ isValid }}</pre>
        </details>
      </form>
    </div>
  </main>
</template>

<style scoped>
.feedback-view {
  padding: 2rem 1rem;
}

.feedback-view__container {
  max-width: 600px;
  margin: 0 auto;
}

.feedback-view__title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-primary, #fff);
}

.feedback-view__subtitle {
  color: var(--text-secondary, #aaa);
  margin-bottom: 2rem;
}

.feedback-view__success {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--bg-card, #1e1e2e);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.feedback-view__success-icon {
  font-size: 3rem;
}

/* ── Form ── */
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feedback-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.feedback-form__field--row {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.feedback-form__field-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feedback-form__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #fff);
}

.feedback-form__required {
  color: #e74c3c;
  margin-left: 0.2rem;
}

.feedback-form__input,
.feedback-form__select,
.feedback-form__textarea {
  background: var(--bg-card, #1e1e2e);
  border: 1px solid var(--border-color, #333);
  border-radius: 0.5rem;
  color: var(--text-primary, #fff);
  font-size: 0.9rem;
  padding: 0.6rem 0.75rem;
  transition: border-color 0.2s;
  outline: none;
  width: 100%;
}

.feedback-form__input:focus,
.feedback-form__select:focus,
.feedback-form__textarea:focus {
  border-color: var(--accent, #6c63ff);
}

.feedback-form__input--error {
  border-color: #e74c3c !important;
}

.feedback-form__textarea {
  resize: vertical;
  font-family: inherit;
}

/* radio group */
.feedback-form__radio-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.feedback-form__radio-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--border-color, #333);
  border-radius: 2rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary, #aaa);
  transition: all 0.2s;
}

.feedback-form__radio-label--active {
  border-color: var(--accent, #6c63ff);
  color: var(--text-primary, #fff);
  background: color-mix(in srgb, var(--accent, #6c63ff) 15%, transparent);
}

.feedback-form__radio {
  display: none;
}

/* checkbox */
.feedback-form__checkbox {
  width: 1.1rem;
  height: 1.1rem;
  cursor: pointer;
  accent-color: var(--accent, #6c63ff);
  flex-shrink: 0;
}

.feedback-form__checkbox-label {
  font-size: 0.875rem;
  color: var(--text-secondary, #aaa);
  cursor: pointer;
}

/* errors */
.feedback-form__error {
  color: #e74c3c;
  font-size: 0.8rem;
}

.feedback-form__error--standalone {
  margin-top: -1rem;
}

.feedback-form__hint {
  font-size: 0.78rem;
  color: var(--text-muted, #666);
  margin-left: auto;
}

/* actions */
.feedback-form__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* debug */
.feedback-form__debug {
  margin-top: 1rem;
  border: 1px dashed var(--border-color, #333);
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.feedback-form__debug summary {
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-secondary, #aaa);
}

.feedback-form__debug pre {
  font-size: 0.75rem;
  color: var(--text-secondary, #aaa);
  margin-top: 0.5rem;
  white-space: pre-wrap;
}
</style>
