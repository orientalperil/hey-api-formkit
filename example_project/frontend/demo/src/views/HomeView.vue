<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <h1>You did it!</h1>
    <p>
      This demo consumes the backend's OpenAPI schema through a
      <a href="https://heyapi.dev/" target="_blank" rel="noopener">hey-api</a> generated client.
    </p>
    <ul>
      <li><RouterLink :to="{ name: 'products' }">Browse products</RouterLink></li>
      <li><RouterLink :to="{ name: 'product-create' }">Create a product</RouterLink></li>
      <li><RouterLink :to="{ name: 'orders' }">Browse orders</RouterLink></li>
      <li><RouterLink :to="{ name: 'order-create' }">Create an order</RouterLink></li>
    </ul>
  </section>
</template>
