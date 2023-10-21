// https://nuxt.com/docs/api/configuration/nuxt-config

import { Head } from "#build/components";

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  components: [
    { path: '~/components/Tools', extensions: ['vue'] },
    { path: '~/components', extensions: ['vue'] }
  ],
  app: {
    // baseURL: '/foxhole-op-planner/',
    buildAssetsDir: 'assets',
    head: {
      script: [{src: 'https://accounts.google.com/gsi/client'},{src: 'https://apis.google.com/js/api.js'}]
    }
  },
  modules: [
    'nuxt-vue3-google-signin'
  ],
  googleSignIn: {
    clientId: '797686098501-cpjla11oe33p2tc6keuro8t313uslnfv.apps.googleusercontent.com',
  }
})
