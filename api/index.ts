import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes.js";

/** Large PDF fetch + ERPNext round-trips can exceed the default 10s on cold start. */
export const config = {
  maxDuration: 60,
};

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

const app = express();
const httpServer = createServer(app);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      console.log(logLine);
    }
  });

  next();
});

let isInitialized = false;

/**
 * Some serverless hosts forward `/api/blog` to the function with `url` set to
 * `/blog` (mount prefix stripped). Express mounts API routes at `/api`, so we
 * restore the prefix when missing.
 */
function ensureApiUrlForExpress(req: Request): void {
  const raw = req.url ?? "";
  const q = raw.indexOf("?");
  const pathname = q === -1 ? raw : raw.slice(0, q);
  const search = q === -1 ? "" : raw.slice(q);
  if (pathname.startsWith("/api")) return;
  if (!pathname || pathname === "/") {
    req.url = `/api${search}`;
    return;
  }
  req.url = `/api${pathname.startsWith("/") ? pathname : `/${pathname}`}${search}`;
}

async function init() {
  if (isInitialized) return;
  await registerRoutes(httpServer, app);
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(`${status} ${message}`);
  });
  isInitialized = true;
}

export default async function handler(req: Request, res: Response) {
  ensureApiUrlForExpress(req);
  await init();
  return app(req, res);
}

