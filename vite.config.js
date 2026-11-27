import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const DEV_API_ROUTES = {
  '/api/sync-all-users': () => import('./api/sync-all-users.js'),
  '/api/product-popularity': () => import('./api/product-popularity.js'),
  '/api/send-reset-link': () => import('./api/send-reset-link.js'),
  '/api/create-order': () => import('./api/create-order.js'),
  '/api/validate-promo': () => import('./api/validate-promo.js'),
  '/api/track-order': () => import('./api/track-order.js'),
  '/api/create-admin-account': () => import('./api/create-admin-account.js'),
  '/api/check-admin': () => import('./api/check-admin.js'),
  '/api/admin-2fa': () => import('./api/admin-2fa.js'),
  '/api/product': () => import('./api/product.js'),
  '/api/og-image': () => import('./api/og-image.js'),
};

function readRawBody(req) {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      resolve('');
      return;
    }
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
  });
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  const isProd = mode === 'production';

  return {
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'dev-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const urlObj = new URL(req.url || '/', 'http://localhost');
            const pathname = urlObj.pathname;
            const loader = DEV_API_ROUTES[pathname];
            if (!loader) {
              next();
              return;
            }

            try {
              const rawBody = await readRawBody(req);
              req.body = rawBody ? JSON.parse(rawBody) : {};
              req.query = Object.fromEntries(urlObj.searchParams.entries());
              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };
              res.send = (data) => {
                res.end(data);
                return res;
              };
              res.redirect = (codeOrUrl, maybeUrl) => {
                const status = typeof codeOrUrl === 'number' ? codeOrUrl : 302;
                const location = typeof codeOrUrl === 'number' ? maybeUrl : codeOrUrl;
                res.statusCode = status;
                res.setHeader('Location', location);
                res.end();
                return res;
              };
              const { default: handler } = await loader();
              await handler(req, res);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        },
      },
    ],
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'lucide-vendor';
            }
          },
        },
      },
    },
  };
});
