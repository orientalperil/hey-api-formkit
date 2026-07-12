<script setup lang="ts">
import { useRouter } from 'vue-router'
import { FormKitSchema } from '@formkit/vue'

import { ordersCreate, productsList, type OrderWritable } from '@/client'
import { OrderWritableFormKitSchema } from '@/client/formkit.gen'
import { applyFieldOverrides } from 'hey-api-formkit'
import { dataSelect } from 'formkit-heads'
import { fetchAll } from 'django-rest-framework-helpers/pagination'
import { HeyApiFormKitSubmitter } from 'django-rest-framework-helpers/submitters/formkit'
import { vuetifyize } from 'formkit-heads/vuetify'

const router = useRouter()

// The generated schema is app-agnostic. `items` is a `repeater` that owns its
// own row array and add/remove controls, so the view supplies no repeat
// scaffolding. The nested `product` select fetches its own options; the result
// is memoized, so every line item shares a single request.
const schema = vuetifyize(applyFieldOverrides(OrderWritableFormKitSchema, {
  product: dataSelect(() => fetchAll(productsList), { value: 'id', label: 'name' }, {
    placeholder: 'Select a product…',
  }),
}))

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
