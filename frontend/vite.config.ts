import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // needed for Docker
    port: 3000,
    strictPort: true, // prevents picking a new port
    watch: {
      usePolling: true,
    },
  },
});
