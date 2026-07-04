<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { FormKitSchema } from '@formkit/vue'
import type { FormKitNode, FormKitSchemaNode } from '@formkit/core'

import { ordersCreate, productsList, type OrderWritable } from '@/client'
import {
  OrderItemWritableSchema,
  OrderWritableSchema,
  StatusEnumSchema,
} from '@/client/schemas.gen'
import { objectToFormKitSchema, repeatableList } from '@/formkit/openapi-to-formkit'

const router = useRouter()

// Resolve the `status` field's `$ref` to the StatusEnum so it becomes a select.
const resolveRef = (ref: string) => (ref.endsWith('/StatusEnum') ? StatusEnumSchema : undefined)

// Top-level order fields (customer_name, status). `items` is handled separately
// as a repeatable list below.
const orderFields = objectToFormKitSchema(OrderWritableSchema, {
  overrides: { items: null },
  resolveRef,
})

// Fields for one line item, generated from the OrderItem model. `product`
// becomes a select fed by `$productOptions`.
const itemFields = objectToFormKitSchema(OrderItemWritableSchema, {
  overrides: {
    product: { $formkit: 'select', options: '$productOptions', placeholder: 'Select a product…' },
  },
})

const removeButton: FormKitSchemaNode = {
  $el: 'button',
  attrs: { type: 'button', class: 'remove-item', onClick: '$makeRemover($index)' },
  children: 'Remove item',
}

const schema: FormKitSchemaNode[] = [
  ...orderFields,
  { $el: 'h3', children: 'Items' },
  repeatableList({
    name: 'items',
    listRef: '$rows',
    keyRef: '$row.key',
    fields: [...itemFields, removeButton],
  }),
]

let nextKey = 1
function addRow() {
  data.rows.push({ key: nextKey++ })
}
function removeRow(index: number) {
  if (data.rows.length > 1) data.rows.splice(index, 1)
}

// Reactive data referenced by the schema.
const data = reactive<{
  productOptions: { value: number; label: string }[]
  rows: { key: number }[]
  makeRemover: (index: number) => () => void
}>({
  productOptions: [],
  rows: [{ key: 0 }],
  makeRemover: (index: number) => () => removeRow(index),
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

:deep(.remove-item) {
  margin-bottom: 1rem;
}
</style>
