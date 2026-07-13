import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { login as loginRequest } from '@/client'
import { getToken, setToken } from '@/auth-token'

export const useAuthStore = defineStore('auth', () => {
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
