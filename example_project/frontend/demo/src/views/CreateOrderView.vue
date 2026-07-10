<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { FormKitSchema } from '@formkit/vue'
import type { FormKitNode } from '@formkit/core'

import { ordersCreate, productsList, type OrderWritable } from '@/client'
import { OrderWritableFormKitSchema } from '@/client/formkit.gen'
import { applyFieldOverrides } from '@/formkit/apply-overrides'
import { dataSelect } from '@/formkit/data-select'
import { fetchAll } from 'django-rest-framework-helpers/pagination'

const router = useRouter()

// The generated schema is app-agnostic — including the repeatable `items` list,
// whose rows/remover it references as `$items_rows` and `$items_remove`
// (supplied below). The nested `product` select fetches its own options; the
// result is memoized, so every line item shares a single request.
const schema = applyFieldOverrides(OrderWritableFormKitSchema, {
  product: dataSelect(() => fetchAll(productsList), { value: 'id', label: 'name' }, {
    placeholder: 'Select a product…',
  }),
})

let nextKey = 1
function addRow() {
  data.items_rows.push({ key: nextKey++ })
}
function removeRow(index: number) {
  if (data.items_rows.length > 1) data.items_rows.splice(index, 1)
}

const data = reactive<{
  items_rows: { key: number }[]
  items_remove: (index: number) => () => void
}>({
  items_rows: [{ key: 0 }],
  items_remove: (index: number) => () => removeRow(index),
})

async function onSubmit(values: OrderWritable, node?: FormKitNode) {
  try {
    await ordersCreate({ body: values, throwOnError: true })
    await router.push('/orders')
  } catch (e) {
    node?.setErrors([e instanceof Error ? e.message : 'Failed to create order'])
  }
}
</script>

<template>
  <section>
    <h2>New order</h2>
    <FormKit type="form" submit-label="Create order" @submit="onSubmit">
      <FormKitSchema :schema="schema" :data="data" />
      <button type="button" class="add-item" @click="addRow">+ Add item</button>
    </FormKit>
  </section>
</template>

<style scoped>
.add-item {
  margin-bottom: 1rem;
}

:deep(.formkit-remove) {
  margin-bottom: 1rem;
}
</style>
