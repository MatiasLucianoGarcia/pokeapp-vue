// ============================================================
// CONCEPTO: reactive() vs ref() para formularios
//
// ref(valor): ideal para un valor suelto (string, number, boolean).
//   Accedés con .value dentro del script.
//
// reactive(objeto): ideal cuando tenés un GRUPO de campos relacionados,
//   como un formulario. No necesitás .value por cada campo.
//   CUIDADO: si desestructurás un reactive(), perdés la reactividad.
//     ❌ const { name } = form   → name ya no es reactivo
//     ✅ form.name               → sí es reactivo
//
// Para formularios: reactive() es la elección natural porque agrupa
// todos los campos en un solo objeto, igual que un FormGroup de Angular.
// ============================================================

import { reactive, computed, ref } from 'vue'

export type FeedbackCategory = 'sugerencia' | 'error' | 'consulta' | ''
export type FeedbackPriority = 'baja' | 'media' | 'alta'

export interface FeedbackFormData {
  pokemonName: string
  email: string
  category: FeedbackCategory
  priority: FeedbackPriority
  rating: number
  description: string
  acceptTerms: boolean
}

export function useFeedbackForm() {
  const submitted = ref(false)
  const isSubmitting = ref(false)

  // reactive() — un solo objeto para todos los campos del form
  // Equivalente a un FormGroup de Angular, pero sin AbstractControl
  const form = reactive<FeedbackFormData>({
    pokemonName: '',
    email: '',
    category: '',
    priority: 'media',
    rating: 5,
    description: '',
    acceptTerms: false,
  })

  // ── VALIDACIÓN REACTIVA ─────────────────────────────────────────
  // computed() recalcula AUTOMÁTICAMENTE cada vez que form cambia.
  // Equivalente a los Validators de Angular, pero sin configuración
  // declarativa — son funciones puras que devuelven strings.
  const errors = computed(() => ({
    pokemonName: !form.pokemonName.trim()
      ? 'El nombre es requerido'
      : '',
    email:
      form.email.length > 0 && !form.email.includes('@')
        ? 'Ingresá un email válido'
        : '',
    category: !form.category ? 'Seleccioná una categoría' : '',
    description:
      form.description.trim().length > 0 &&
      form.description.trim().length < 10
        ? 'Mínimo 10 caracteres'
        : '',
    acceptTerms: !form.acceptTerms ? 'Debés aceptar los términos' : '',
  }))

  // isValid: el form es válido cuando NO hay errores en los campos obligatorios
  const isValid = computed(
    () =>
      form.pokemonName.trim() !== '' &&
      !errors.value.email &&
      form.category !== '' &&
      !errors.value.description &&
      form.acceptTerms,
  )

  // ── ACTIONS ────────────────────────────────────────────────────
  async function submitForm(): Promise<void> {
    if (!isValid.value) return
    isSubmitting.value = true
    // Simula latencia de red (en un caso real: fetch/axios aquí)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    isSubmitting.value = false
    submitted.value = true
  }

  function resetForm(): void {
    form.pokemonName = ''
    form.email = ''
    form.category = ''
    form.priority = 'media'
    form.rating = 5
    form.description = ''
    form.acceptTerms = false
    submitted.value = false
  }

  return { form, errors, isValid, submitted, isSubmitting, submitForm, resetForm }
}
