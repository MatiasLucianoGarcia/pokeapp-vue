// ============================================================
// CONCEPTO: InjectionKey — Tipado seguro para provide/inject
//
// provide/inject es el sistema de "contexto" de Vue.
// Permite pasar datos a CUALQUIER descendiente sin prop drilling.
//
// El problema sin InjectionKey: inject() devuelve 'unknown' o 'any'.
// Con InjectionKey<T>: TypeScript sabe exactamente qué tipo retorna inject().
//
// Usamos Symbol() para garantizar unicidad del key.
// Dos Symbols son siempre distintos aunque tengan el mismo description.
// ============================================================

import type { InjectionKey, Ref } from 'vue'

// Key tipado para el tema: el inject() sabrá que es Ref<'dark' | 'light'>
export const THEME_KEY: InjectionKey<Ref<'dark' | 'light'>> = Symbol('theme')
