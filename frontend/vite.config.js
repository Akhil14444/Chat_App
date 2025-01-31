import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "frontend/dist", // Ensure the build output is in the correct folder
    rollupOptions: {
      external: ["zustand"],
    },
  },
  optimizeDeps: {
    include: ["zustand"],
  },
});
