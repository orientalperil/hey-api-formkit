import { defineStore } from "pinia"
import { computed, ref } from "vue"

import { getToken, setToken } from "@/auth-token"
import { login as loginRequest } from "@/client"

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(getToken())
  const isAuthenticated = computed(() => token.value !== null)

  async function login(username: string, password: string) {
    const { data } = await loginRequest({ body: { username, password }, throwOnError: true })
    token.value = data.token
    setToken(data.token)
  }

  function logout() {
    token.value = null
    setToken(null)
  }

  return { token, isAuthenticated, login, logout }
})
