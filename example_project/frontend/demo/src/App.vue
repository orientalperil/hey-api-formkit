<script setup lang="ts">
import { storeToRefs } from "pinia"
import { RouterLink, RouterView, useRouter } from "vue-router"

import { useAuthStore } from "@/stores/auth"

const router = useRouter()
const auth = useAuthStore()
const { isAuthenticated } = storeToRefs(auth)

function logout() {
  auth.logout()
  router.push({ name: "login" })
}
</script>

<template>
  <header class="app-header px-8">
    <h1>Demo</h1>
    <nav>
      <RouterLink :to="{ name: 'home' }">Home</RouterLink>
      <RouterLink :to="{ name: 'products' }">Products</RouterLink>
      <RouterLink :to="{ name: 'product-create' }">New product</RouterLink>
      <RouterLink :to="{ name: 'orders' }">Orders</RouterLink>
      <RouterLink :to="{ name: 'order-create' }">New order</RouterLink>
      <RouterLink v-if="!isAuthenticated" :to="{ name: 'login' }" class="right">Log in</RouterLink>
      <button v-else type="button" class="right link" @click="logout">Log out</button>
    </nav>
  </header>

  <main class="px-8">
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

nav .right {
  margin-left: auto;
}

nav .link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: #2c3e50;
  cursor: pointer;
}

main {
  max-width: 40rem;
}
</style>
