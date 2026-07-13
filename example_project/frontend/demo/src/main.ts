import { plugin as formKitPlugin } from '@formkit/vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import './assets/tailwind.css'

import App from './App.vue'
import { formkitConfig } from './plugins/formkit'
import { vuetify } from './plugins/vuetify'
import router from './router'

import 'formkit-heads/vuetify/vuetify-formkit-overrides.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(formKitPlugin, formkitConfig)

app.mount('#app')
