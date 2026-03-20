import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  /** Consente di aprire il dev server dal telefono sulla stessa Wi‑Fi (usa l’IP del PC, non localhost). */
  server: {
    host: true,
  },
});
