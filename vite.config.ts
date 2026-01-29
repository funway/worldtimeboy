import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      closeBundle() {
        // Copy manifest.json and icons to dist, and move HTML file
        try {
          const distDir = resolve(__dirname, 'dist');
          mkdirSync(distDir, { recursive: true });
          
          // Move HTML file from dist/src/popup/index.html to dist/popup/index.html
          const srcHtmlPath = resolve(__dirname, 'dist/src/popup/index.html');
          const destHtmlPath = resolve(__dirname, 'dist/popup/index.html');
          if (existsSync(srcHtmlPath)) {
            mkdirSync(resolve(__dirname, 'dist/popup'), { recursive: true });
            copyFileSync(srcHtmlPath, destHtmlPath);
            // Update HTML file to fix asset paths (remove /popup prefix since we're in popup folder)
            let htmlContent = readFileSync(destHtmlPath, 'utf-8');
            // Replace /popup/ with ./ in asset paths
            htmlContent = htmlContent.replace(/\/popup\//g, './');
            writeFileSync(destHtmlPath, htmlContent);
            
            // Clean up src directory
            try {
              rmSync(resolve(__dirname, 'dist/src'), { recursive: true, force: true });
            } catch (e) {
              // Ignore errors
            }
          }
          
          // Copy manifest.json
          copyFileSync(
            resolve(__dirname, 'public/manifest.json'),
            resolve(__dirname, 'dist/manifest.json')
          );
          
          // Copy icons directory
          const iconsDir = resolve(__dirname, 'public/icons');
          const distIconsDir = resolve(__dirname, 'dist/icons');
          if (existsSync(iconsDir)) {
            mkdirSync(distIconsDir, { recursive: true });
            const files = readdirSync(iconsDir);
            files.forEach((file: string) => {
              if (file.endsWith('.png')) {
                copyFileSync(
                  resolve(iconsDir, file),
                  resolve(distIconsDir, file)
                );
              }
            });
          }
        } catch (e) {
          console.error('Failed to copy manifest.json', e);
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' ? 'background/[name].js' : 'popup/[name].js';
        },
        chunkFileNames: 'popup/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          // HTML files should go to popup/index.html
          if (name.includes('index.html')) {
            return 'popup/index.html';
          }
          // CSS files
          if (name.endsWith('.css')) {
            return 'popup/[name].[ext]';
          }
          return 'popup/[name].[ext]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
