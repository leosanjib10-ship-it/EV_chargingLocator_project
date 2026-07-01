import { createPinia } from 'pinia'

// A single shared Pinia instance so the store can be used both inside
// components and outside of them (axios interceptors, router guards).
export const pinia = createPinia()

export default pinia
