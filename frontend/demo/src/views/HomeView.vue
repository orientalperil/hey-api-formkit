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
      <li><RouterLink to="/products">Browse products</RouterLink></li>
      <li><RouterLink to="/products/new">Create a product</RouterLink></li>
      <li><RouterLink to="/orders/new">Create an order</RouterLink></li>
    </ul>
  </section>
</template>
