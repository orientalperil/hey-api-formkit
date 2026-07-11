import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'

// Vuetify 4 defaults theme to "system"; we pin an explicit light/dark pair so
// the demo looks consistent. Components & directives are auto-imported by
// vite-plugin-vuetify, so we don't enumerate them here.
export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#5b4ee5',
          surface: '#ffffff',
        },
      },
    },
  },
  defaults: {
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
  },
})
