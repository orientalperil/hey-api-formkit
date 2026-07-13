<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import { useOrdersStore } from '@/stores/orders'

const store = useOrdersStore()
const { orders, loading, error } = storeToRefs(store)

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

const statusClasses: Record<string, string> = {
  pending: 'bg-gray-200 text-gray-600',
  paid: 'bg-green-100 text-green-800',
  shipped: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
}

function orderTotal(items: { quantity?: number; unit_price: string }[]): string {
  const total = items.reduce((sum, item) => sum + (item.quantity ?? 0) * Number(item.unit_price), 0)
  return total.toFixed(2)
}

onMounted(() => store.fetchOrders())
</script>

<template>
  <section class="max-w-2xl">
    <header class="flex items-center justify-between gap-4">
      <h2>Orders</h2>
      <v-btn
        prepend-icon="mdi-refresh"
        variant="tonal"
        :loading="loading"
        @click="store.fetchOrders()"
      >
        Refresh
      </v-btn>
    </header>

    <p v-if="error" class="text-red-700">{{ error }}</p>
    <p v-else-if="loading && orders.length === 0">Loading orders…</p>
    <p v-else-if="orders.length === 0">No orders yet.</p>

    <ul v-else class="mt-4 flex flex-col gap-3 list-none p-0">
      <li
        v-for="order in orders"
        :key="order.id"
        class="border border-gray-300 rounded-lg px-4 py-3"
      >
        <div class="flex justify-between font-semibold">
          <span>{{ order.customer_name }}</span>
          <span class="flex items-center gap-2">
            <span
              class="text-sm capitalize rounded-full px-2 py-0.5"
              :class="statusClasses[order.status ?? 'pending']"
            >
              {{ order.status }}
            </span>
            <RouterLink
              :to="{ name: 'order-edit', params: { id: order.id } }"
              class="inline-flex text-inherit"
              aria-label="Edit order"
            >
              <v-icon icon="mdi-pencil" size="small" />
            </RouterLink>
          </span>
        </div>
        <p class="my-1 text-gray-600 text-sm">
          #{{ order.id }} · {{ dateFormat.format(new Date(order.created_at)) }} ·
          {{ order.items.length }} item{{ order.items.length === 1 ? '' : 's' }} ·
          <strong>${{ orderTotal(order.items) }}</strong>
        </p>
        <ul class="list-none p-0 m-0 text-sm">
          <li v-for="item in order.items" :key="item.pk">
            {{ item.quantity }} × {{ item.product_name }}
            <span class="text-gray-500">@ ${{ item.unit_price }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>
