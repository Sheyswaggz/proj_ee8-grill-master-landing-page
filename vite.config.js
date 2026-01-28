import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    cssCodeSplit: true,
    cssMinify: true,
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          
          if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    
    reportCompressedSize: true,
    
    manifest: false,
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        comments: false
      }
    }
  },
  
  server: {
    port: 3000,
    strictPort: false,
    host: 'localhost',
    open: false,
    cors: true,
    
    hmr: {
      overlay: true
    },
    
    watch: {
      usePolling: false,
      interval: 100
    }
  },
  
  preview: {
    port: 4173,
    strictPort: false,
    host: 'localhost',
    open: false,
    cors: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  
  css: {
    devSourcemap: true,
    
    preprocessorOptions: {},
    
    postcss: null
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    },
    extensions: ['.mjs', '.js', '.json', '.css']
  },
  
  optimizeDeps: {
    include: [],
    exclude: []
  },
  
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: '',
    logOverride: {
      'this-is-undefined-in-esm': 'silent'
    },
    drop: ['console', 'debugger'],
    legalComments: 'none',
    treeShaking: true
  },
  
  logLevel: 'info',
  clearScreen: true,
  
  appType: 'spa'
});