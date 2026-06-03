import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import obfuscator from 'vite-plugin-javascript-obfuscator';


export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    css: {
      devSourcemap: false, // Hide CSS sourcemaps in dev
    },
    plugins: [
      react(), 
      tailwindcss(),
      /* mode === 'production' && obfuscator({
        options: {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 1,
          numbersToExpressions: true,
          simplify: true,
          stringArrayThreshold: 1,
          splitStrings: true,
          splitStringsChunkLength: 5,
          unicodeEscapeSequence: true,
          identifierNamesGenerator: 'hexadecimal',
          selfDefending: false, // Disable to prevent breaking dev logic
          debugProtection: false, // Disable to prevent breaking dev logic
          debugProtectionInterval: 0,
          disableConsoleOutput: false,
        }
      }) */
    ].filter(Boolean),

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@/app/stores': path.resolve(__dirname, 'src/components/ui/CloudScroll/stores'),
        '@stores': path.resolve(__dirname, 'src/components/ui/CloudScroll/stores'),
        '@constants': path.resolve(__dirname, 'src/components/ui/CloudScroll/constants'),
        '@types': path.resolve(__dirname, 'src/components/ui/CloudScroll/types'),
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: true, // Bind to 0.0.0.0 so phones/laptops on the same network can access
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      sourcemap: false, // Prevents hackers from seeing original source code in production
      minify: 'esbuild',
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split heavy vendor libraries into separate chunks for better caching and faster initial load
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-three': ['three', '@splinetool/react-spline', '@splinetool/runtime'],
            'vendor-ui': ['framer-motion', 'lucide-react', 'gsap', 'lenis', 'motion'],
            'vendor-utils': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/analytics'],
            'vendor-charts': ['recharts'],
          }
        }
      }
    },
  };
});
