import { vuetifyFormKitConfig } from "formkit-heads/vuetify"
import { repeater } from "./repeater"

export const formkitConfig = vuetifyFormKitConfig({
  inputs: { vrepeater: repeater },
})
