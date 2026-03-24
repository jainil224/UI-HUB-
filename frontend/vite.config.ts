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
      mode === 'production' && obfuscator({
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
      })
    ].filter(Boolean),

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      sourcemap: false, // Prevents hackers from seeing original source code in production
      minify: 'esbuild',
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
    },
  };
});
