<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  ordersCreate,
  productsList,
  StatusEnum,
  type OrderItemWritable,
  type OrderWritable,
  type Product,
} from '@/client'

const router = useRouter()

function emptyItem(): OrderItemWritable {
  return { product: null as unknown as number, quantity: 1, unit_price: '' }
}

const form = ref<OrderWritable>({
  customer_name: '',
  status: StatusEnum.PENDING,
  items: [emptyItem()],
})

const products = ref<Product[]>([])
const submitting = ref(false)
const error = ref<string | null>(null)

const statusOptions = Object.values(StatusEnum)

onMounted(async () => {
  try {
    const { data } = await productsList({ throwOnError: true })
    products.value = data
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load products'
  }
})

function addItem() {
  form.value.items.push(emptyItem())
}

function removeItem(index: number) {
  form.value.items.splice(index, 1)
}

// Prefill unit price from the selected product for convenience.
function onProductChange(item: OrderItemWritable) {
  const product = products.value.find((p) => p.id === item.product)
  if (product) item.unit_price = product.price
}

async function submit() {
  submitting.value = true
  error.value = null
  try {
    await ordersCreate({ body: form.value, throwOnError: true })
    await router.push('/products')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create order'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section>
    <h2>New order</h2>
    <p v-if="error" class="error">{{ error }}</p>

    <form @submit.prevent="submit">
      <label>
        Customer name
        <input v-model="form.customer_name" type="text" required />
      </label>

      <label>
        Status
        <select v-model="form.status">
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>

      <fieldset>
        <legend>Items</legend>
        <div v-for="(item, index) in form.items" :key="index" class="item-row">
          <label>
            Product
            <select v-model.number="item.product" required @change="onProductChange(item)">
              <option :value="undefined" disabled>Select a product…</option>
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </label>

          <label>
            Qty
            <input v-model.number="item.quantity" type="number" min="1" />
          </label>

          <label>
            Unit price
            <input v-model="item.unit_price" type="text" inputmode="decimal" required />
          </label>

          <button
            type="button"
            class="remove"
            :disabled="form.items.length === 1"
            @click="removeItem(index)"
          >
            ✕
          </button>
        </div>

        <button type="button" @click="addItem">+ Add item</button>
      </fieldset>

      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Saving…' : 'Create order' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 32rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 600;
}

input,
select {
  padding: 0.4rem 0.5rem;
  font: inherit;
}

fieldset {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 0.6fr 1fr auto;
  gap: 0.5rem;
  align-items: end;
  margin-bottom: 0.75rem;
}

.remove {
  padding: 0.4rem 0.6rem;
}

button[type='submit'] {
  align-self: flex-start;
}

.error {
  color: #c0392b;
}
</style>
