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
  }
})
