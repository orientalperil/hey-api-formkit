import { ref } from 'vue'
import { defineStore } from 'pinia'

import { productsList, type Product } from '@/client'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const { data } = await productsList()
      products.value = data ?? []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load products'
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, fetchProducts }
})
