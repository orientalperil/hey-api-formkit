<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { FormKitSchema } from '@formkit/vue'
import type { FormKitNode } from '@formkit/core'

import { categoriesList, productsCreate, suppliersList, type ProductWritable } from '@/client'
import { ProductWritableSchema } from '@/client/schemas.gen'
import { objectToFormKitSchema } from '@/formkit/openapi-to-formkit'

const router = useRouter()

// FormKit schema generated from the OpenAPI `ProductWritable` model. Relation
// fields (supplier/category) become selects whose options come from `data`.
const schema = objectToFormKitSchema(ProductWritableSchema, {
  overrides: {
    supplier: {
      $formkit: 'select',
      options: '$supplierOptions',
      placeholder: 'Select a supplier…',
    },
    category: {
      $formkit: 'select',
      options: '$categoryOptions',
    },
    in_stock: { value: true },
  },
})

// Reactive data referenced by the schema (`$supplierOptions`, `$categoryOptions`).
const data = reactive<{
  supplierOptions: { value: number; label: string }[]
  categoryOptions: { value: number | null; label: string }[]
}>({
  supplierOptions: [],
  categoryOptions: [{ value: null, label: '— None —' }],
})

onMounted(async () => {
  const [suppliers, categories] = await Promise.all([
    suppliersList({ throwOnError: true }),
    categoriesList({ throwOnError: true }),
  ])
  data.supplierOptions = suppliers.data.map((s) => ({ value: s.id, label: s.name }))
  data.categoryOptions = [
    { value: null, label: '— None —' },
    ...categories.data.map((c) => ({ value: c.id, label: c.name })),
  ]
})

async function onSubmit(values: ProductWritable, node?: FormKitNode) {
  try {
    await productsCreate({ body: values, throwOnError: true })
    await router.push('/products')
  } catch (e) {
    node?.setErrors([e instanceof Error ? e.message : 'Failed to create product'])
  }
}
</script>

<template>
  <section>
    <h2>New product</h2>
    <FormKit type="form" submit-label="Create product" @submit="onSubmit">
      <FormKitSchema :schema="schema" :data="data" />
    </FormKit>
  </section>
</template>
