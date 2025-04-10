import "dotenv/config"
import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {

  return {
    root   : "./src",
    plugins: [react()],
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          sourceMap: true
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      tsconfig: "./tsconfig.test.json",
      setupFiles: './vitest.setup.ts',
      coverage: {
        reporter: ['text', 'html'],
      },
    },
    assetsInclude: ["../icons/*.png"], // Ensure these file types are included
    build: {
      outDir               : "../dist/frontend",
      emptyOutDir          : true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            return null;
          }
        }
      },
      // target: 'esnext', // Ensure modern ESM output
      // commonjsOptions: {
      //   transformMixedEsModules: true, // Allows processing ESM in CJS
      // },
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "^/(api)\\b" : {
          target      : `http://127.0.0.1:4001`,
          changeOrigin: true,
          secure      : false,
        }
      }
    },
    define: {
      NODE_ENV              : JSON.stringify(process.env.NODE_ENV || "development"),
      REACT_APP_BACKEND_HOST: JSON.stringify(process.env.REACT_APP_BACKEND_HOST || (mode === "test" ? "http://localhost:5555" : "")),
      REACT_APP_NOTEBOOK_URL: JSON.stringify(process.env.REACT_APP_NOTEBOOK_URL || ""),
    },
  }
})
