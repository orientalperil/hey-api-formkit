<script setup lang="ts">
import { RouterLink } from 'vue-router'

import OrderList from '@/components/OrderList.vue'
</script>

<template>
  <div>
    <RouterLink :to="{ name: 'order-create' }">+ New order</RouterLink>
    <OrderList />
  </div>
</template>
