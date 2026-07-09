import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '../App.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }],
})

describe('App', () => {
  it('renders the nav links', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })
    await router.isReady()
    expect(wrapper.text()).toContain('Products')
    expect(wrapper.find('a[href="/products/new"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/orders/new"]').exists()).toBe(true)
  })
})
