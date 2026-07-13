<script setup lang="ts">
import { RouterLink } from "vue-router"

import ProductList from "@/components/ProductList.vue"
</script>

<template>
  <div>
    <RouterLink :to="{ name: 'product-create' }">+ New product</RouterLink>
    <ProductList />
  </div>
</template>
