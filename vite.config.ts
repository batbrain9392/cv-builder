import fs from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage } from "node:http";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { validateCvBody } from "./src/lib/validateCvBody.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function cvFilePath(): string {
  return path.resolve(__dirname, "content", "cv.md");
}

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

function sendJson(res: { statusCode: number; setHeader: (n: string, v: string) => void; end: (b: string) => void }, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function cvApiPlugin(): Plugin {
  return {
    name: "cv-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/cv")) {
          next();
          return;
        }

        const resolved = cvFilePath();

        if (req.method === "GET") {
          try {
            const body = await fs.readFile(resolved, "utf8");
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/markdown; charset=utf-8");
            res.end(body);
          } catch {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end("Failed to read CV file.");
          }
          return;
        }

        if (req.method === "PUT") {
          try {
            const raw = await readRequestBody(req);
            const check = validateCvBody(raw);
            if (!check.ok) {
              sendJson(res, 400, { ok: false, error: check.error, code: check.code });
              return;
            }
            await fs.mkdir(path.dirname(resolved), { recursive: true });
            await fs.writeFile(resolved, raw, "utf8");
            sendJson(res, 200, { ok: true });
          } catch {
            sendJson(res, 500, { ok: false, error: "Failed to write CV file." });
          }
          return;
        }

        res.statusCode = 405;
        res.setHeader("Allow", "GET, PUT");
        res.end();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), cvApiPlugin()],
});
