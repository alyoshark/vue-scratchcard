import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/",
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'vue-scratchcard',
      fileName: (format) => `vue-scratchcard.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
});
