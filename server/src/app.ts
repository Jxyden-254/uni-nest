// Express application setup for UNI-NEST.
// Keeping app creation separate from the listener makes testing easier.
import cors from "cors";
import express, { Express, Request, Response } from "express";

export function createApp(): Express {
  const app = express();

  // Allow the Next.js client (different port) to call this API.
  app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

  // Parse JSON request bodies.
  app.use(express.json());

  // Simple health check endpoint to confirm the server is running.
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "uni-nest-api" });
  });

  return app;
}
