<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { FormKitSchema } from '@formkit/vue'
import type { FormKitSchemaNode } from '@formkit/core'
import { VBtn } from 'vuetify/components'

import { ordersCreate, productsList, type OrderWritable } from '@/client'
import { OrderWritableFormKitSchema } from '@/client/formkit.gen'
import { applyFieldOverrides } from 'hey-api-formkit'
import { dataSelect } from "formkit-heads"
import { fetchAll } from 'django-rest-framework-helpers/pagination'
import { HeyApiFormKitSubmitter } from 'django-rest-framework-helpers/submitters/formkit'
import { vuetifyize } from "formkit-heads/vuetify"

const router = useRouter()

// The generated schema is app-agnostic — including the repeatable `items` list,
// whose rows/remover it references as `$items_rows` and `$items_remove`
// (supplied below). The nested `product` select fetches its own options; the
// result is memoized, so every line item shares a single request.
const schema = vuetifyRemoveButtons(vuetifyize(applyFieldOverrides(OrderWritableFormKitSchema, {
  product: dataSelect(() => fetchAll(productsList), { value: 'id', label: 'name' }, {
    placeholder: 'Select a product…',
  }),
})))

// The generated schema renders each row's remover as a plain <button
// class="formkit-remove">. Rewrite those nodes in place to Vuetify buttons
// (resolved via <FormKitSchema :library>) so they match the rest of the form.
function vuetifyRemoveButtons(nodes: FormKitSchemaNode[]): FormKitSchemaNode[] {
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    const el = node as Record<string, unknown>
    const attrs = el.attrs as Record<string, unknown> | undefined
    if (el.$el === 'button' && attrs?.class === 'formkit-remove') {
      delete el.$el
      delete el.attrs
      el.$cmp = 'VBtn'
      el.props = {
        color: 'error',
        variant: 'text',
        size: 'small',
        onClick: attrs.onClick,
      }
    }
    if (Array.isArray(el.children)) vuetifyRemoveButtons(el.children as FormKitSchemaNode[])
  }
  return nodes
}

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
      <FormKitSchema :schema="schema" :data="data" :library="{ VBtn }" />
      <v-btn variant="tonal" class="add-item" @click="addRow">+ Add item</v-btn>
      <div>
        <v-btn type="submit" color="primary">Create order</v-btn>
      </div>
    </FormKit>
  </section>
</template>

<style scoped>
.add-item {
  margin-bottom: 1rem;
}
</style>
