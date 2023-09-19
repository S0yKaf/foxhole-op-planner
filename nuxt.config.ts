// https://nuxt.com/docs/api/configuration/nuxt-config

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
  },
  modules: [
    'nuxt-vue3-google-signin'
  ],
  googleSignIn: {
    clientId: '797686098501-cpjla11oe33p2tc6keuro8t313uslnfv.apps.googleusercontent.com',
  }
})
