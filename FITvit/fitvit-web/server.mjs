import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "public");
const dbPath = path.join(__dirname, "db", "mockData.json");
const usersDbPath = path.join(__dirname, "db", "users.json");
const workspaceRoot = path.resolve(__dirname, "..");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

const spaRoutes = new Set([
  "/",
  "/index.html",
  "/app.html",
  "/signin",
  "/signup",
  "/dashboard",
  "/marketplace",
  "/nutrition-vault",
  "/meal-planner",
  "/profile-settings",
  "/daily-nutrition",
  "/onboarding"
]);

async function readDb() {
  const raw = await readFile(dbPath, "utf-8");
  return JSON.parse(raw);
}

async function writeDb(data) {
  await writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

async function readUsersDb() {
  try {
    const raw = await readFile(usersDbPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.users)) {
      return { users: [] };
    }
    return parsed;
  } catch {
    return { users: [] };
  }
}

async function writeUsersDb(data) {
  await writeFile(usersDbPath, JSON.stringify(data, null, 2), "utf-8");
}

function normalizeUid(uid) {
  return String(uid || "").trim().toLowerCase();
}

function hashPassword(password, saltHex) {
  const salt = saltHex || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(String(password || ""), salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const text = String(storedHash || "");
  const parts = text.split(":");
  if (parts.length !== 2) return false;
  const [salt, expected] = parts;
  const actual = hashPassword(password, salt).split(":")[1];

  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function safeResolve(base, reqPath) {
  const resolved = path.resolve(base, "." + reqPath);
  if (!resolved.startsWith(base)) {
    return null;
  }
  return resolved;
}

async function serveFile(res, filePath) {
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, mimeTypes[ext] || "application/octet-stream");
  } catch {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
  }
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf-8");
      resolve(raw ? JSON.parse(raw) : {});
    });
    req.on("error", reject);
  });
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return;
  }

  if (url.pathname === "/api/auth/signup" && req.method === "POST") {
    try {
      const body = await getBody(req);
      const uid = normalizeUid(body.uid || body.email);
      const name = String(body.name || "FitVit User").trim() || "FitVit User";
      const password = String(body.password || "");

      if (!uid || !password) {
        send(res, 400, JSON.stringify({ ok: false, message: "Email and password are required." }));
        return;
      }

      const db = await readUsersDb();
      const exists = db.users.find((u) => normalizeUid(u.uid) === uid);
      if (exists) {
        send(res, 409, JSON.stringify({ ok: false, message: "Account already exists." }));
        return;
      }

      const user = {
        uid,
        name,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      await writeUsersDb(db);

      send(
        res,
        201,
        JSON.stringify({
          ok: true,
          user: { uid: user.uid, name: user.name },
          token: `dev-user-${Buffer.from(uid).toString("base64url")}`
        })
      );
    } catch {
      send(res, 400, JSON.stringify({ ok: false, message: "Could not create account." }));
    }
    return;
  }

  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    try {
      const body = await getBody(req);
      const uid = normalizeUid(body.uid || body.email);
      const password = String(body.password || "");

      if (!uid || !password) {
        send(res, 400, JSON.stringify({ ok: false, message: "Email and password are required." }));
        return;
      }

      const db = await readUsersDb();
      const user = db.users.find((u) => normalizeUid(u.uid) === uid);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        send(res, 401, JSON.stringify({ ok: false, message: "Invalid credentials." }));
        return;
      }

      send(
        res,
        200,
        JSON.stringify({
          ok: true,
          user: { uid: user.uid, name: user.name || "FitVit User" },
          token: `dev-user-${Buffer.from(uid).toString("base64url")}`
        })
      );
    } catch {
      send(res, 400, JSON.stringify({ ok: false, message: "Could not sign in." }));
    }
    return;
  }

  if (url.pathname === "/api/login" && req.method === "POST") {
    try {
      const body = await getBody(req);
      const username = String(body.username || "").trim();
      const password = String(body.password || "").trim();
      const ok = username === "admin" && password === "admin";
      if (!ok) {
        send(res, 401, JSON.stringify({ ok: false, message: "Invalid credentials" }));
        return;
      }
      send(
        res,
        200,
        JSON.stringify({ ok: true, user: { name: "Admin", role: "admin" }, token: "dev-admin-token" })
      );
    } catch {
      send(res, 400, JSON.stringify({ ok: false, message: "Bad request" }));
    }
    return;
  }

  if (url.pathname === "/api/bootstrap" && req.method === "GET") {
    const db = await readDb();
    send(res, 200, JSON.stringify(db));
    return;
  }

  if (url.pathname === "/api/messes" && req.method === "GET") {
    const db = await readDb();
    send(res, 200, JSON.stringify(db.messes));
    return;
  }

  if (url.pathname === "/api/menu" && req.method === "GET") {
    const db = await readDb();
    send(res, 200, JSON.stringify(db.menu));
    return;
  }

  if (url.pathname === "/api/messes" && req.method === "POST") {
    try {
      const body = await getBody(req);
      const db = await readDb();
      const nextId = Math.max(0, ...db.messes.map((m) => m.id)) + 1;
      const mess = {
        id: nextId,
        name: body.name,
        type: body.type || "Veg",
        pricePerMonth: Number(body.pricePerMonth || 0),
        distanceKm: Number(body.distanceKm || 0),
        rating: Number(body.rating || 0),
        hygiene: Number(body.hygiene || 0)
      };
      db.messes.push(mess);
      await writeDb(db);
      send(res, 201, JSON.stringify(mess));
    } catch {
      send(res, 400, JSON.stringify({ ok: false, message: "Could not create mess" }));
    }
    return;
  }

  // Serve Stitch exports so you can review your original pages from inside this app.
  if (url.pathname.startsWith("/stitch/")) {
    const relative = decodeURIComponent(url.pathname.replace("/stitch/", ""));
    const safePath = safeResolve(workspaceRoot, "/" + relative);
    if (!safePath) {
      send(res, 403, "Forbidden", "text/plain; charset=utf-8");
      return;
    }
    await serveFile(res, safePath);
    return;
  }

  const isSpaRoute = spaRoutes.has(url.pathname);
  const route = isSpaRoute ? "/app.html" : url.pathname;
  const filePath = safeResolve(publicDir, route);
  if (!filePath) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  await serveFile(res, filePath);
}).listen(5173, () => {
  console.log("FitVit web app running on http://localhost:5173");
});
