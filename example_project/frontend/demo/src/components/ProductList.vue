<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useProductsStore } from '@/stores/products'

const store = useProductsStore()
const { products, loading, error } = storeToRefs(store)

onMounted(() => store.fetchProducts())
</script>

<template>
  <section>
    <header>
      <h2>Products</h2>
      <button type="button" :disabled="loading" @click="store.fetchProducts()">
        {{ loading ? 'Loading…' : 'Refresh' }}
      </button>
    </header>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading && products.length === 0">Loading products…</p>
    <p v-else-if="products.length === 0">No products yet.</p>

    <ul v-else class="products">
      <li v-for="product in products" :key="product.id">
        <div class="product-head">
          <span class="name">{{ product.name }}</span>
          <span class="price">${{ product.price }}</span>
        </div>
        <p v-if="product.description" class="description">{{ product.description }}</p>
        <span class="stock" :class="{ out: !product.in_stock }">
          {{ product.in_stock ? 'In stock' : 'Out of stock' }}
        </span>
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

.products {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.products li {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
}

.product-head {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}

.description {
  margin: 0.25rem 0;
  color: #555;
}

.stock {
  font-size: 0.85rem;
  color: #2e7d32;
}

.stock.out {
  color: #c0392b;
}
</style>
