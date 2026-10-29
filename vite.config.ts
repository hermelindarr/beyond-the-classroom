import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// The production build is a single index.html (code, fonts and images inlined)
// so it opens by double-click from a USB stick with no server and no internet.
// Videos and media.js stay as separate files next to it, copied from public/.
export default defineConfig(({ command }) => ({
  base: "./",
  plugins: [react(), ...(command === "build" ? [viteSingleFile()] : [])],
  build: {
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 4000,
  },
}));
