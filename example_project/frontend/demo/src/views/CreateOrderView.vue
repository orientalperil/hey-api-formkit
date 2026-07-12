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
const schema = vuetifyOrderSchema(vuetifyize(applyFieldOverrides(OrderWritableFormKitSchema, {
  product: dataSelect(() => fetchAll(productsList), { value: 'id', label: 'name' }, {
    placeholder: 'Select a product…',
  }),
})))

// Post-process the generated schema for Vuetify. Each repeatable line-item row
// is a `group` whose fields render flat into the form (no wrapper element), so:
//  - swap the row's plain <button class="formkit-remove"> for a Vuetify button
//    (resolved via <FormKitSchema :library>) to match the rest of the form, and
//  - give the row's first field a top margin *between* rows only, gated on the
//    `for` loop's `$index`. FormKit's expression compiler has no ternary, so we
//    use a `&&` short-circuit: it yields 'mt-6' for rows after the first and
//    `false` (ignored) for row 0, so the first row still lines up with the flat
//    fields above it.
function vuetifyOrderSchema(nodes: FormKitSchemaNode[]): FormKitSchemaNode[] {
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    const el = node as Record<string, unknown>

    if (el.$formkit === 'group' && Array.isArray(el.children)) {
      const first = el.children[0] as Record<string, unknown> | undefined
      if (first && typeof first === 'object') first.outerClass = "$index > 0 && 'mt-6'"
    }

    const attrs = el.attrs as Record<string, unknown> | undefined
    if (el.$el === 'button' && attrs?.class === 'formkit-remove') {
      delete el.$el
      delete el.attrs
      el.$cmp = 'VBtn'
      el.props = {
        color: 'error',
        variant: 'tonal',
        onClick: attrs.onClick,
      }
    }

    if (Array.isArray(el.children)) vuetifyOrderSchema(el.children as FormKitSchemaNode[])
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
      <v-btn variant="tonal" class="ml-2" @click="addRow">+ Add item</v-btn>
      <div class="mt-4">
        <v-btn type="submit" color="primary">Create order</v-btn>
      </div>
    </FormKit>
  </section>
</template>
