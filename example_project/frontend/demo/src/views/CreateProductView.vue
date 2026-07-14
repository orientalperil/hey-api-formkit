<script setup lang="ts">
import { FormKitSchema } from "@formkit/vue"
import { fetchAll } from "django-rest-framework-helpers/pagination"
import { HeyApiFormKitSubmitter } from "django-rest-framework-helpers/submitters/formkit"
import { loaderSelect } from "formkit-heads"
import { vuetifyize } from "formkit-heads/vuetify"
import { applyFieldOverrides } from "hey-api-formkit"
import { useRouter } from "vue-router"

import { categoriesList, productsCreate, suppliersList, type ProductWritable } from "@/client"
import { ProductWritableFormKitSchema } from "@/client/formkit.gen"

const router = useRouter()

// The generated schema is app-agnostic; wire this app's relation selects here.
// Each select fetches its own options from the SDK endpoint — no reactive data
// or onMounted needed. Just point it at the list call and map value/label.
const schema = vuetifyize(
  applyFieldOverrides(ProductWritableFormKitSchema, {
    supplier: loaderSelect(
      () => fetchAll(suppliersList),
      { value: "id", label: "name" },
      {
        placeholder: "Select a supplier…",
      },
    ),
    category: loaderSelect(
      () => fetchAll(categoriesList),
      { value: "id", label: "name" },
      {
        nullable: true,
      },
    )
  }),
)

class ProductSubmitter extends HeyApiFormKitSubmitter<ProductWritable> {
  override async action(data: ProductWritable) {
    await productsCreate({ body: data })
  }
  override async success() {
    await router.push({ name: "products" })
  }
}
const submitter = new ProductSubmitter()
</script>

<template>
  <section>
    <h2>New product</h2>
    <FormKit type="form" :value="{ in_stock: true }" :actions="false" @submit="submitter.submit">
      <FormKitSchema :schema="schema" />
      <v-btn type="submit" color="primary">Create product</v-btn>
    </FormKit>
  </section>
</template>
