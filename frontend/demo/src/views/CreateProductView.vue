<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { FormKitSchema } from '@formkit/vue'
import type { FormKitNode } from '@formkit/core'

import { categoriesList, productsCreate, suppliersList, type ProductWritable } from '@/client'
import { ProductWritableFormKitSchema } from '@/client/formkit.gen'
import { applyFieldOverrides } from '@/formkit/apply-overrides'

const router = useRouter()

// The generated schema is app-agnostic; wire this app's relation selects here.
const schema = applyFieldOverrides(ProductWritableFormKitSchema, {
  supplier: {
    $formkit: 'select',
    options: '$supplierOptions',
    placeholder: 'Select a supplier…',
  },
  category: {
    $formkit: 'select',
    options: '$categoryOptions',
  },
})

// Runtime data referenced by the schema (`$supplierOptions`, `$categoryOptions`).
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
    <FormKit type="form" :value="{ in_stock: true }" submit-label="Create product" @submit="onSubmit">
      <FormKitSchema :schema="schema" :data="data" />
    </FormKit>
  </section>
</template>
