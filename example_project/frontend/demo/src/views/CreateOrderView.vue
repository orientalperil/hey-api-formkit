<script setup lang="ts">
import { FormKitSchema } from '@formkit/vue'
import { fetchAll } from 'django-rest-framework-helpers/pagination'
import { HeyApiFormKitSubmitter } from 'django-rest-framework-helpers/submitters/formkit'
import { loaderSelect } from 'formkit-heads'
import { vuetifyize } from 'formkit-heads/vuetify'
import { applyFieldOverrides } from 'hey-api-formkit'
import { useRouter } from 'vue-router'

import { ordersCreate, productsList, type OrderWritable } from '@/client'
import { OrderWritableFormKitSchema } from '@/client/formkit.gen'

const router = useRouter()

// The generated schema is app-agnostic. `items` is a `repeater` that owns its
// own row array and add/remove controls, so the view supplies no repeat
// scaffolding. The nested `product` select fetches its own options; the result
// is memoized, so every line item shares a single request.
const schema = vuetifyize(
  applyFieldOverrides(OrderWritableFormKitSchema, {
    items: { min: 1 },
    'items.product': loaderSelect(
      () => fetchAll(productsList),
      { value: 'id', label: 'name' },
      {
        placeholder: 'Select a product…',
      },
    ),
  }),
)

class OrderSubmitter extends HeyApiFormKitSubmitter<OrderWritable> {
  override async action(data: OrderWritable) {
    await ordersCreate({ body: data })
  }
  override async success() {
    await router.push('/orders')
  }
}
const submitter = new OrderSubmitter()
</script>

<template>
  <section>
    <h2>New order</h2>
    <FormKit type="form" :actions="false" @submit="submitter.submit">
      <FormKitSchema :schema="schema" />
      <div class="mt-4">
        <v-btn type="submit" color="primary">Create order</v-btn>
      </div>
    </FormKit>
  </section>
</template>
