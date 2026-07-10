<script setup lang="ts">
import { useRouter } from 'vue-router'
import { FormKitSchema } from '@formkit/vue'
import type { FormKitNode } from '@formkit/core'

import { categoriesList, productsCreate, suppliersList, type ProductWritable } from '@/client'
import { ProductWritableFormKitSchema } from '@/client/formkit.gen'
import { applyFieldOverrides } from '@/formkit/apply-overrides'
import { dataSelect } from '@/formkit/data-select'
import { fetchAll } from 'django-rest-framework-helpers/pagination'

const router = useRouter()

// The generated schema is app-agnostic; wire this app's relation selects here.
// Each select fetches its own options from the SDK endpoint — no reactive data
// or onMounted needed. Just point it at the list call and map value/label.
const schema = applyFieldOverrides(ProductWritableFormKitSchema, {
  supplier: dataSelect(() => fetchAll(suppliersList), { value: 'id', label: 'name' }, {
    placeholder: 'Select a supplier…',
  }),
  category: dataSelect(() => fetchAll(categoriesList), { value: 'id', label: 'name' }, {
    nullable: true,
  }),
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
      <FormKitSchema :schema="schema" />
    </FormKit>
  </section>
</template>
