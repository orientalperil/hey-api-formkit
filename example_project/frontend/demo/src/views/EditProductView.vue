<script setup lang="ts">
import { FormKitSchema } from '@formkit/vue'
import { fetchAll } from 'django-rest-framework-helpers/pagination'
import { HeyApiFormKitSubmitter } from 'django-rest-framework-helpers/submitters/formkit'
import { loaderSelect } from 'formkit-heads'
import { vuetifyize } from 'formkit-heads/vuetify'
import { applyFieldOverrides } from 'hey-api-formkit'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  categoriesList,
  productsRetrieve,
  productsUpdate,
  suppliersList,
  type ProductWritable,
} from '@/client'
import { ProductWritableFormKitSchema } from '@/client/formkit.gen'

const route = useRoute()
const router = useRouter()
const productId = Number(route.params.id)

// Same overrides as the create form, wiring this app's relation selects.
const schema = vuetifyize(
  applyFieldOverrides(ProductWritableFormKitSchema, {
    supplier: loaderSelect(
      () => fetchAll(suppliersList),
      { value: 'id', label: 'name' },
      {
        placeholder: 'Select a supplier…',
      },
    ),
    category: loaderSelect(
      () => fetchAll(categoriesList),
      { value: 'id', label: 'name' },
      {
        nullable: true,
      },
    ),
  }),
)

class ProductSubmitter extends HeyApiFormKitSubmitter<ProductWritable> {
  override async action(data: ProductWritable) {
    await productsUpdate({ path: { id: productId }, body: data })
  }
  override async success() {
    await router.push('/products')
  }
}
const submitter = new ProductSubmitter()

// Form only renders once the existing product has loaded, so the repeater/
// select inputs seed their initial state from real data instead of empty.
const initialValue = ref<ProductWritable>()

onMounted(async () => {
  const { data } = await productsRetrieve({ path: { id: productId } })
  if (data) {
    initialValue.value = {
      name: data.name,
      description: data.description,
      price: data.price,
      in_stock: data.in_stock,
      category: data.category ?? null,
      supplier: data.supplier,
    }
  }
})
</script>

<template>
  <section>
    <h2>Edit product</h2>
    <FormKit
      v-if="initialValue"
      type="form"
      :value="initialValue"
      :actions="false"
      @submit="submitter.submit"
    >
      <FormKitSchema :schema="schema" />
      <v-btn type="submit" color="primary">Save product</v-btn>
    </FormKit>
    <p v-else>Loading…</p>
  </section>
</template>
