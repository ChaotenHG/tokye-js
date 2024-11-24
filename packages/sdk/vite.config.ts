import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      name: "Example Component",
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["axios", "@simplewebauthn/browser"],
      output: {
        globals: {
          axios: "Axios",
          "@simplewebauthn/browser": "@simplewebauthn/browser",
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
