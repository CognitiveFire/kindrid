const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/kindrid/' : '/',
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  preview: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    allowedHosts: ['healthcheck.railway.app', 'localhost', '.railway.app']
  }
})
