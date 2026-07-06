import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { plugin as formKitPlugin, defaultConfig as formKitConfig } from '@formkit/vue'
import '@formkit/themes/genesis'

import App from './App.vue'
import router from './router'
import { dataSelectInput } from './formkit/data-select'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(formKitPlugin, formKitConfig({ inputs: { dataSelect: dataSelectInput } }))

app.mount('#app')
