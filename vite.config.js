import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'dev-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const pathname = req.url ? req.url.split('?')[0] : '';
            if (pathname === '/api/send-reset-link') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  req.body = body ? JSON.parse(body) : {};
                  res.status = (code) => { res.statusCode = code; return res; };
                  res.json = (data) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return res;
                  };
                  const { default: handler } = await import('./api/send-reset-link.js');
                  await handler(req, res);
                } catch (err) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            'firebase-vendor': ['firebase/app', 'firebase/firestore'],
            'react-vendor': ['react', 'react-dom'],
            'lucide-vendor': ['lucide-react'],
          },
        },
      },
    },
  };
});
