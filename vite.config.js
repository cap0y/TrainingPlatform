import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    allowedHosts: [
      "5c87d8d0-3aa6-45dc-adb3-e18022599d45-00-rk1q7wk1mnxb.janeway.replit.dev",
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      ".replit.dev",
      ".replit.app"
    ],
    host: "0.0.0.0",
    hmr: {
      host: "0.0.0.0",
      port: 24678,
    },
    disableHostCheck: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
