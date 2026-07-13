<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import type { FormKitNode } from '@formkit/core'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

async function onSubmit(
  values: { username: string; password: string },
  node?: FormKitNode,
) {
  try {
    await auth.login(values.username, values.password)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch {
    node?.setErrors(['Invalid username or password.'])
  }
}
</script>

<template>
  <section>
    <h2>Log in</h2>
    <FormKit type="form" submit-label="Log in" @submit="onSubmit">
      <FormKit type="text" name="username" label="Username" validation="required" autocomplete="username" />
      <FormKit
        type="password"
        name="password"
        label="Password"
        validation="required"
        autocomplete="current-password"
      />
    </FormKit>
  </section>
</template>
