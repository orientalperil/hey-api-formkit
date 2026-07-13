import App from "../App.vue"
import { mount } from "@vue/test-utils"
import { createPinia } from "pinia"
import { describe, expect, it } from "vitest"
import { createMemoryHistory, createRouter } from "vue-router"

const stub = { template: "<div />" }

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", name: "home", component: stub },
    { path: "/login", name: "login", component: stub },
    { path: "/products", name: "products", component: stub },
    { path: "/products/new", name: "product-create", component: stub },
    { path: "/orders", name: "orders", component: stub },
    { path: "/orders/new", name: "order-create", component: stub },
  ],
})

describe("App", () => {
  it("renders the nav links", async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })
    await router.isReady()
    expect(wrapper.text()).toContain("Products")
    expect(wrapper.find('a[href="/products/new"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/orders/new"]').exists()).toBe(true)
  })
})
