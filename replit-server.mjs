import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

// Initialize the Netlify-compatible environment before loading its handlers.
process.env.COUNCIL_LOCAL_RUNTIME = "1";
globalThis.Netlify = { env: { get: key => process.env[key] } };

const routes = new Map();
for (const name of ["ai", "auth", "stats", "admin", "friends", "rooms", "shares"]) {
  const module = await import(`./netlify/functions/${name}.mts`);
  for (const path of [module.config.path].flat()) routes.set(path, module.default);
}
const publicRoot = new URL("./public/", import.meta.url);
const { storageReady, closeStorage } = await import("./netlify/lib/store.mts");
const maxBodyBytes = 450000;

export function createCouncilServer() {
  return createServer(async (incoming, outgoing) => {
    const controller = new AbortController();
    outgoing.on("close", () => {
      if (!outgoing.writableEnded) controller.abort();
    });
    try {
      const host = incoming.headers.host || "localhost";
      const protocol = incoming.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const url = new URL(incoming.url || "/", `${protocol}://${host}`);
      const handler = routes.get(url.pathname);
      outgoing.setHeader("X-Content-Type-Options", "nosniff");
      outgoing.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      if (handler) {
        const chunks = [];
        let size = 0;
        for await (const chunk of incoming) {
          size += chunk.length;
          if (size > maxBodyBytes) {
            outgoing.writeHead(413, { "Content-Type": "application/json" });
            outgoing.end(JSON.stringify({ code: "prompt_too_large" }));
            return;
          }
          chunks.push(chunk);
        }
        const method = incoming.method || "GET";
        const headers = new Headers();
        for (const [name, value] of Object.entries(incoming.headers)) {
          if (value) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
        }
        const req = new Request(url, {
          method, headers, signal: controller.signal,
          ...(method === "GET" || method === "HEAD" ? {} : { body: Buffer.concat(chunks) }),
        });
        const ip = String(incoming.headers["x-forwarded-for"] || incoming.socket.remoteAddress || "unknown").split(",")[0].trim();
        const response = await handler(req, { ip });
        outgoing.writeHead(response.status, Object.fromEntries(response.headers));
        if (response.body && method !== "HEAD") await pipeline(Readable.fromWeb(response.body), outgoing);
        else outgoing.end();
        return;
      }
      if (incoming.method !== "GET" && incoming.method !== "HEAD") {
        outgoing.writeHead(405); outgoing.end("Method not allowed"); return;
      }
      // The imported website is a single page. Never expose source, secrets,
      // server-only prompts or local account records as static files.
      if (url.pathname !== "/" && url.pathname !== "/index.html") {
        outgoing.writeHead(404); outgoing.end("Not found"); return;
      }
      const page = await readFile(new URL("index.html", publicRoot));
      outgoing.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      outgoing.end(incoming.method === "HEAD" ? undefined : page);
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("[server] Request failed:", error.message);
      if (!outgoing.headersSent) {
        outgoing.writeHead(500, { "Content-Type": "application/json", "Cache-Control": "no-store" });
        outgoing.end(JSON.stringify({ code: "server_error", message: "The request could not be completed." }));
      } else outgoing.destroy();
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await storageReady();
  const port = Number(process.env.PORT || 5000);
  const server = createCouncilServer();
  server.listen(port, "0.0.0.0", () => {
    console.log(`The Council is listening on port ${port}`);
    console.log("Durable PostgreSQL account/usage storage enabled; Netlify data remains separate.");
  });
  for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => {
    server.close(async () => { await closeStorage(); process.exit(0); });
    setTimeout(() => process.exit(0), 5000).unref();
  });
}