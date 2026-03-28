import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/galaxywave/',
    server: {
        port: 5173
    },
    build: {
        outDir: 'dist'
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly'
        }
    }
});
