import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Plugin to copy manifest and icons
const copyPublicFiles = () => ({
  name: 'copy-public-files',
  writeBundle() {
    // Copy manifest.json
    fs.copyFileSync(
      path.resolve(__dirname, 'public/manifest.json'),
      path.resolve(__dirname, 'dist/manifest.json')
    );
    // Copy icons
    const iconSizes = [16, 32, 48, 128];
    iconSizes.forEach(size => {
      const filename = `icon${size}.png`;
      fs.copyFileSync(
        path.resolve(__dirname, `public/${filename}`),
        path.resolve(__dirname, `dist/${filename}`)
      );
    });

    // Move HTML files to correct locations
    const distDir = path.resolve(__dirname, 'dist');

    // Move popup HTML
    if (fs.existsSync(path.join(distDir, 'src/popup/index.html'))) {
      if (!fs.existsSync(path.join(distDir, 'popup'))) {
        fs.mkdirSync(path.join(distDir, 'popup'), { recursive: true });
      }
      fs.copyFileSync(
        path.join(distDir, 'src/popup/index.html'),
        path.join(distDir, 'popup/index.html')
      );
    }

    // Move ui HTML
    if (fs.existsSync(path.join(distDir, 'src/ui/index.html'))) {
      if (!fs.existsSync(path.join(distDir, 'ui'))) {
        fs.mkdirSync(path.join(distDir, 'ui'), { recursive: true });
      }
      fs.copyFileSync(
        path.join(distDir, 'src/ui/index.html'),
        path.join(distDir, 'ui/index.html')
      );
    }

    // Clean up src directory in dist
    if (fs.existsSync(path.join(distDir, 'src'))) {
      fs.rmSync(path.join(distDir, 'src'), { recursive: true, force: true });
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyPublicFiles()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup/index.html'),
        ui: path.resolve(__dirname, 'src/ui/index.html'),
        background: path.resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/index.js'
          }
          return '[name]/[name].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.html')) {
            if (assetInfo.name.includes('popup')) {
              return 'popup/index.html'
            }
            if (assetInfo.name.includes('ui')) {
              return 'ui/index.html'
            }
          }
          return 'assets/[name]-[hash].[ext]'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})