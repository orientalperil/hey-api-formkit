<script setup lang="ts">
import { FormKitSchema } from '@formkit/vue'
import { HeyApiFormKitSubmitter } from 'django-rest-framework-helpers/submitters/formkit'
import { vuetifyize } from 'formkit-heads/vuetify'
import { applyFieldOverrides } from 'hey-api-formkit'
import { useRoute, useRouter } from 'vue-router'

import { type Login } from '@/client'
import { LoginFormKitSchema } from '@/client/formkit.gen'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Generated login schema; `password` is a plain string in the API. Keep the
// input as text (so vuetifyize maps it to the vuetify text field) but mask it
// via `inputType`, which the vuetify TextInput forwards to the v-text-field.
const schema = vuetifyize(
  applyFieldOverrides(LoginFormKitSchema, {
    username: { vuetifyProps: { autocomplete: 'username' } },
    password: { $formkit: 'password', vuetifyProps: { autocomplete: 'current-password' } },
  }),
)

class LoginSubmitter extends HeyApiFormKitSubmitter<Login> {
  override async action(data: Login) {
    await auth.login(data.username, data.password)
  }
  override async success() {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  }
}
const submitter = new LoginSubmitter()
</script>

<template>
  <section>
    <h2>Log in</h2>
    <FormKit type="form" :actions="false" @submit="submitter.submit">
      <FormKitSchema :schema="schema" />
      <div class="mt-4">
        <v-btn type="submit" color="primary">Log in</v-btn>
      </div>
    </FormKit>
  </section>
</template>
