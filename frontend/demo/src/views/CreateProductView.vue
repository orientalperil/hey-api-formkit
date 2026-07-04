<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  categoriesList,
  productsCreate,
  suppliersList,
  type Category,
  type ProductWritable,
  type Supplier,
} from '@/client'

const router = useRouter()

const form = ref<ProductWritable>({
  name: '',
  description: '',
  price: '',
  in_stock: true,
  category: null,
  supplier: null as unknown as number,
})

const suppliers = ref<Supplier[]>([])
const categories = ref<Category[]>([])
const submitting = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const [suppliersRes, categoriesRes] = await Promise.all([
      suppliersList({ throwOnError: true }),
      categoriesList({ throwOnError: true }),
    ])
    suppliers.value = suppliersRes.data
    categories.value = categoriesRes.data
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load form options'
  }
})

async function submit() {
  submitting.value = true
  error.value = null
  try {
    await productsCreate({ body: form.value, throwOnError: true })
    await router.push('/products')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create product'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section>
    <h2>New product</h2>
    <p v-if="error" class="error">{{ error }}</p>

    <form @submit.prevent="submit">
      <label>
        Name
        <input v-model="form.name" type="text" required />
      </label>

      <label>
        Description
        <textarea v-model="form.description" rows="3"></textarea>
      </label>

      <label>
        Price
        <input v-model="form.price" type="text" inputmode="decimal" placeholder="0.00" required />
      </label>

      <label>
        Supplier
        <select v-model.number="form.supplier" required>
          <option :value="undefined" disabled>Select a supplier…</option>
          <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </label>

      <label>
        Category
        <select v-model.number="form.category">
          <option :value="null">— None —</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </label>

      <label class="checkbox">
        <input v-model="form.in_stock" type="checkbox" />
        In stock
      </label>

      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Saving…' : 'Create product' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 24rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 600;
}

label.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

input,
textarea,
select {
  padding: 0.4rem 0.5rem;
  font: inherit;
}

button {
  align-self: flex-start;
}

.error {
  color: #c0392b;
}
</style>
