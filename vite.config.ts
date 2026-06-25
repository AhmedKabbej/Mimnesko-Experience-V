import { defineConfig } from 'vite'
import type { Connect, ViteDevServer, PreviewServer } from 'vite'
import react from '@vitejs/plugin-react'

const PDF_FILE = '/Guide_Mimnesko_Install.pdf'

// Sert le PDF sur /pdf en local (dev + preview), comme le rewrite vercel.json en prod.
function pdfShortcut() {
  const redirect: Connect.NextHandleFunction = (req, res, next) => {
    const url = ((req as { url?: string }).url || '').split('?')[0]
    if (url === '/pdf' || url === '/pdf/') {
      res.statusCode = 302
      res.setHeader('Location', PDF_FILE)
      res.end()
      return
    }
    next()
  }
  return {
    name: 'pdf-shortcut',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(redirect)
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(redirect)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pdfShortcut()],
})
