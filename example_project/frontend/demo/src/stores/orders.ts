import { ref } from 'vue'
import { defineStore } from 'pinia'

import { ordersList, type Order } from '@/client'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOrders() {
    loading.value = true
    error.value = null
    try {
      const { data } = await ordersList({ throwOnError: true })
      orders.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load orders'
    } finally {
      loading.value = false
    }
  }

  return { orders, loading, error, fetchOrders }
})
