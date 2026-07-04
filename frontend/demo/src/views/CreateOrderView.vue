<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { FormKitSchema } from '@formkit/vue'
import type { FormKitNode, FormKitSchemaNode } from '@formkit/core'

import { ordersCreate, productsList, type OrderWritable } from '@/client'
import { OrderWritableFormKitSchema } from '@/client/formkit.gen'

const router = useRouter()

// Generated at build time by the custom FormKit hey-api plugin — including the
// repeatable `items` list, whose rows/remover it references as `$items_rows`
// and `$items_remove` (supplied below).
const schema = OrderWritableFormKitSchema as unknown as FormKitSchemaNode[]

let nextKey = 1
function addRow() {
  data.items_rows.push({ key: nextKey++ })
}
function removeRow(index: number) {
  if (data.items_rows.length > 1) data.items_rows.splice(index, 1)
}

const data = reactive<{
  productOptions: { value: number; label: string }[]
  items_rows: { key: number }[]
  items_remove: (index: number) => () => void
}>({
  productOptions: [],
  items_rows: [{ key: 0 }],
  items_remove: (index: number) => () => removeRow(index),
})

onMounted(async () => {
  const { data: products } = await productsList({ throwOnError: true })
  data.productOptions = products.map((p) => ({ value: p.id, label: p.name }))
})

async function onSubmit(values: OrderWritable, node?: FormKitNode) {
  try {
    await ordersCreate({ body: values, throwOnError: true })
    await router.push('/products')
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
