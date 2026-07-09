<script setup lang="ts">
import { RouterLink } from 'vue-router'

import ProductList from '@/components/ProductList.vue'
</script>

<template>
  <div>
    <RouterLink to="/products/new">+ New product</RouterLink>
    <ProductList />
  </div>
</template>
