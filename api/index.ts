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

/**
 * Normalize `req.url` / `originalUrl` to pathname + query (handles absolute URLs on
 * some serverless hosts).
 */
function pathnameAndSearchFrom(raw: string): { pathname: string; search: string } {
  const trimmed = (raw || "").trim();
  if (!trimmed) return { pathname: "/", search: "" };
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const u = new URL(trimmed);
      return { pathname: u.pathname || "/", search: u.search || "" };
    }
  } catch {
    /* ignore */
  }
  const hash = trimmed.indexOf("#");
  const withoutHash = hash === -1 ? trimmed : trimmed.slice(0, hash);
  const q = withoutHash.indexOf("?");
  if (q === -1) return { pathname: withoutHash || "/", search: "" };
  return { pathname: withoutHash.slice(0, q) || "/", search: withoutHash.slice(q) };
}

let isInitialized = false;

/**
 * Some serverless hosts forward `/api/blog` to the function with `url` set to
 * `/blog` (mount prefix stripped). Express mounts API routes at `/api`, so we
 * restore the prefix when missing.
 */
function ensureApiUrlForExpress(req: Request): void {
  let pick = typeof req.url === "string" ? req.url : "";
  const orig = (req as unknown as { originalUrl?: string }).originalUrl;
  if ((!pick || pick === "/") && typeof orig === "string" && orig.trim().length > 0) {
    pick = orig;
  }

  const { pathname, search } = pathnameAndSearchFrom(pick);

  if (pathname.startsWith("/api")) {
    req.url = `${pathname}${search}`;
    return;
  }
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

