import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import path from 'path'

const __dirname = path.resolve()

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isLib ? [
        dts({
          include: ['src/lib/**/*'],
          exclude: ['src/lib/**/*.test.ts', 'src/lib/**/*.test.tsx', 'src/lib/**/__tests__/**/*'],
          outDir: 'dist',
          insertTypesEntry: true,
          rollupTypes: false,
          copyDtsFiles: true
        })
      ] : [])
    ],
    ...(isLib ? {
      build: {
        lib: {
          entry: {
            index: path.resolve(__dirname, 'src/lib/index.ts'),
            components: path.resolve(__dirname, 'src/lib/components/index.ts'),
            config: path.resolve(__dirname, 'src/lib/config/index.ts'),
            utils: path.resolve(__dirname, 'src/lib/utils/index.ts'),
            theme: path.resolve(__dirname, 'src/lib/components/theme-provider.tsx')
          },
          formats: ['es', 'cjs']
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            'react/jsx-runtime'
          ],
          output: [
            {
              format: 'es',
              entryFileNames: '[name].js',
              chunkFileNames: 'chunks/[name]-[hash].js',
              assetFileNames: 'assets/[name]-[hash][extname]',
              preserveModules: true,
              preserveModulesRoot: 'src/lib',
              exports: 'named'
            },
            {
              format: 'cjs',
              entryFileNames: '[name].cjs',
              chunkFileNames: 'chunks/[name]-[hash].cjs',
              assetFileNames: 'assets/[name]-[hash][extname]',
              exports: 'named'
            }
          ]
        },
        sourcemap: true,
        minify: false
      }
    } : {
      root: 'demo',
      build: {
        outDir: '../dist-demo'
      }
    })
  }
})
