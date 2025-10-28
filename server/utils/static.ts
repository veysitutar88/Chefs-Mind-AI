import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function mountStatic(app: Express) {
  // В production бандле: dist/index.js ищет dist/public
  // import.meta.dirname в бандле будет указывать на dist/
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}