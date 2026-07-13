<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import { useOrdersStore } from '@/stores/orders'

const store = useOrdersStore()
const { orders, loading, error } = storeToRefs(store)

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

function orderTotal(items: { quantity?: number; unit_price: string }[]): string {
  const total = items.reduce((sum, item) => sum + (item.quantity ?? 0) * Number(item.unit_price), 0)
  return total.toFixed(2)
}

onMounted(() => store.fetchOrders())
</script>

<template>
  <section>
    <header>
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

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading && orders.length === 0">Loading orders…</p>
    <p v-else-if="orders.length === 0">No orders yet.</p>

    <ul v-else class="orders">
      <li v-for="order in orders" :key="order.id">
        <div class="order-head">
          <span class="customer">{{ order.customer_name }}</span>
          <span class="head-actions">
            <span class="status" :class="order.status">{{ order.status }}</span>
            <RouterLink
              :to="{ name: 'order-edit', params: { id: order.id } }"
              class="edit-link"
              aria-label="Edit order"
            >
              <v-icon icon="mdi-pencil" size="small" />
            </RouterLink>
          </span>
        </div>
        <p class="meta">
          #{{ order.id }} · {{ dateFormat.format(new Date(order.created_at)) }} ·
          {{ order.items.length }} item{{ order.items.length === 1 ? '' : 's' }} ·
          <strong>${{ orderTotal(order.items) }}</strong>
        </p>
        <ul class="items">
          <li v-for="item in order.items" :key="item.id">
            {{ item.quantity }} × {{ item.product_name }}
            <span class="unit-price">@ ${{ item.unit_price }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>

<style scoped>
section {
  max-width: 32rem;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.error {
  color: #c0392b;
}

.orders {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.orders > li {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
}

.order-head {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-link {
  display: inline-flex;
  color: inherit;
}

.status {
  font-size: 0.85rem;
  text-transform: capitalize;
  padding: 0.1rem 0.5rem;
  border-radius: 0.75rem;
  background: #eee;
  color: #555;
}

.status.paid,
.status.shipped {
  background: #e6f4ea;
  color: #2e7d32;
}

.status.cancelled {
  background: #fdecea;
  color: #c0392b;
}

.meta {
  margin: 0.35rem 0;
  color: #555;
  font-size: 0.9rem;
}

.items {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
}

.unit-price {
  color: #777;
}
</style>
