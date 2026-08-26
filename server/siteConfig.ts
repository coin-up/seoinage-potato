import type { Express } from "express";

export function getSiteConfig() {
  return { title: process.env.VITE_APP_TITLE || "谷口の背負い投げポテト｜受付管理" };
}

export function registerSiteConfigRoute(app: Express) {
  app.get("/api/site-config", (_request, response) => {
    response.json(getSiteConfig());
  });
}
