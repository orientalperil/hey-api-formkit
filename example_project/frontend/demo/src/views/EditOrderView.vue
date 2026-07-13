<script setup lang="ts">
import { FormKitSchema } from '@formkit/vue'
import { fetchAll } from 'django-rest-framework-helpers/pagination'
import { HeyApiFormKitSubmitter } from 'django-rest-framework-helpers/submitters/formkit'
import { loaderSelect } from 'formkit-heads'
import { vuetifyize } from 'formkit-heads/vuetify'
import { applyFieldOverrides } from 'hey-api-formkit'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ordersRetrieve, ordersUpdate, productsList, type OrderWritable } from '@/client'
import { OrderWritableFormKitSchema } from '@/client/formkit.gen'

const route = useRoute()
const router = useRouter()
const orderId = Number(route.params.id)

// Same overrides as the create form: `items` is a repeater and its nested
// `product` select fetches its own options.
const schema = vuetifyize(
  applyFieldOverrides(OrderWritableFormKitSchema, {
    items: { min: 1 },
    // Carried through (hidden) so the backend can match a row back to its
    // OrderItem on save instead of deleting and recreating every item.
    'items.pk': { $formkit: 'hidden' },
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
    await ordersUpdate({ path: { id: orderId }, body: data })
  }
  override async success() {
    await router.push({ name: 'orders' })
  }
}
const submitter = new OrderSubmitter()

// Form only renders once the existing order has loaded, so the repeater
// seeds its rows from the real line items instead of starting empty.
const initialValue = ref<OrderWritable>()

onMounted(async () => {
  const { data } = await ordersRetrieve({ path: { id: orderId } })
  if (data) {
    initialValue.value = {
      customer_name: data.customer_name,
      status: data.status,
      items: data.items.map((item) => ({
        pk: item.pk,
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    }
  }
})
</script>

<template>
  <section>
    <h2>Edit order</h2>
    <FormKit
      v-if="initialValue"
      type="form"
      :value="initialValue"
      :actions="false"
      @submit="submitter.submit"
    >
      <FormKitSchema :schema="schema" />
      <div class="mt-4">
        <v-btn type="submit" color="primary">Save order</v-btn>
      </div>
    </FormKit>
    <p v-else>Loading…</p>
  </section>
</template>
