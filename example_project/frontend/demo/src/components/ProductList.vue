<script setup lang="ts">
import { storeToRefs } from "pinia"
import { onMounted } from "vue"
import { RouterLink } from "vue-router"

import { useProductsStore } from "@/stores/products"

const store = useProductsStore()
const { products, loading, error } = storeToRefs(store)

onMounted(() => store.fetchProducts())
</script>

<template>
  <section class="max-w-2xl">
    <header class="flex items-center justify-between gap-4">
      <h2>Products</h2>
      <v-btn
        prepend-icon="mdi-refresh"
        variant="tonal"
        :loading="loading"
        @click="store.fetchProducts()"
      >
        Refresh
      </v-btn>
    </header>

    <p v-if="error" class="text-red-700">{{ error }}</p>
    <p v-else-if="loading && products.length === 0">Loading products…</p>
    <p v-else-if="products.length === 0">No products yet.</p>

    <ul v-else class="mt-4 flex flex-col gap-3 list-none p-0">
      <li
        v-for="product in products"
        :key="product.id"
        class="border border-gray-300 rounded-lg px-4 py-3"
      >
        <div class="flex justify-between font-semibold">
          <span>{{ product.name }}</span>
          <span class="flex items-center gap-2">
            <span>${{ product.price }}</span>
            <RouterLink
              :to="{ name: 'product-edit', params: { id: product.id } }"
              class="inline-flex text-inherit"
              aria-label="Edit product"
            >
              <v-icon icon="mdi-pencil" size="small" />
            </RouterLink>
          </span>
        </div>
        <p v-if="product.description" class="my-1 text-gray-600">{{ product.description }}</p>
        <span class="text-sm" :class="product.in_stock ? 'text-green-700' : 'text-red-700'">
          {{ product.in_stock ? "In stock" : "Out of stock" }}
        </span>
      </li>
    </ul>
  </section>
</template>
