import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { type Server } from "http";

export async function setupProductionVite(app: Express, server: Server) {
  // For production deployment, create a simplified Vite server with proper host configuration
  const vite = await createViteServer({
    configFile: false,
    mode: "development", // Use development mode to avoid build requirements
    server: {
      middlewareMode: true,
      hmr: { server },
      host: "0.0.0.0", // Allow all hosts
    },
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "client", "src"),
        "@shared": path.resolve(process.cwd(), "shared"),
        "@assets": path.resolve(process.cwd(), "attached_assets"),
      },
    },
    root: path.resolve(process.cwd(), "client"),
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // Serve the main HTML file for all non-API routes
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Skip API routes
      if (url.startsWith('/api/') || url.startsWith('/uploads/')) {
        return next();
      }

      const template = await fs.promises.readFile(
        path.resolve(process.cwd(), "client", "index.html"),
        "utf-8"
      );

      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      console.error("Error serving HTML:", e);
      next(e);
    }
  });

  return vite;
}