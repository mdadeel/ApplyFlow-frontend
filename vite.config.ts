import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * CSP header applied in development mode via Vite dev server HTTP headers.
 * Relaxed to allow React Refresh HMR (inline scripts + WebSocket).
 */
const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "connect-src 'self' ws: https://app.posthog.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ')

/**
 * Strict CSP as a <meta> tag injected only during production builds.
 * No 'unsafe-inline' on scripts — Vite bundles everything into static files.
 */
const PROD_CSP_META = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://app.posthog.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ')

/**
 * Vite plugin that injects the strict CSP <meta> tag into the built HTML.
 * In dev mode this plugin is a no-op — the dev server uses HTTP headers instead.
 */
function cspPlugin(): PluginOption {
  let isBuild = false
  return {
    name: 'applyflow-csp',
    enforce: 'post',
    configResolved(config) {
      // Vite sets config.command to 'build' or 'serve'.
      // This is the reliable way to check mode, unlike process.env.NODE_ENV.
      isBuild = config.command === 'build'
    },
    transformIndexHtml() {
      // Only inject during production builds (vite build).
      // In dev mode, CSP is served as an HTTP header by the dev server.
      if (isBuild) {
        return [
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content: PROD_CSP_META,
            },
            injectTo: 'head',
          },
        ]
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), cspPlugin()],
  server: {
    port: 5173,
    headers: {
      'Content-Security-Policy': DEV_CSP,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        timeout: 900000,
        proxyTimeout: 900000,
      },
    },
  },
})
