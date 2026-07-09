<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <h1>Demo</h1>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/products">Products</RouterLink>
      <RouterLink to="/products/new">New product</RouterLink>
      <RouterLink to="/orders">Orders</RouterLink>
      <RouterLink to="/orders/new">New order</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  border-bottom: 1px solid #ddd;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  text-decoration: none;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  font-weight: 700;
  color: #42b883;
}

main {
  max-width: 40rem;
}
</style>
