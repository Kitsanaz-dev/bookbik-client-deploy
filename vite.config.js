import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  preview: {
    host: true,              // same as 0.0.0.0
    port: 5173,
    strictPort: true,
    allowedHosts: ["ceit-iot-lab.site"],
  },
});