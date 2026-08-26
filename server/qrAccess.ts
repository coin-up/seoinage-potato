import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";
import type { QrAccessMode } from "@shared/const";

const QR_SESSION_COOKIE = "__Host-potato_qr";
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/**
 * These entry tokens are server-only. The QR images should encode the URLs
 * returned by createQrEntryUrl; the browser never receives the token value.
 */
const QR_ENTRY_TOKENS: Record<QrAccessMode, string> = {
  buyer: "qrb_7Xv2mK9pL4sN8cQ1",
  admin: "qra_3Fd8zR6tY1wP5hJ7",
  combined: "qrc_9Lm4vB2xS8kH6nT3",
};

const modePaths: Record<QrAccessMode, string> = {
  buyer: "buyer",
  admin: "admin",
  combined: "combined",
};

const attachedQrPaths: Record<string, QrAccessMode> = {
  "/buyer-only-x5k9m2a7q8r3": "buyer",
  "/buyer-a7k9m2x5q8r3": "combined",
  "/admin-b4n6p1j9w2e8": "admin",
};

type SessionPayload = { mode: QrAccessMode; expiresAt: number };

function signingKey() {
  return ENV.cookieSecret || "local-development-cookie-secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", signingKey()).update(value).digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${sign(value)}`;
}

function decodeSession(value: string | undefined): SessionPayload | null {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const expectedSignature = Buffer.from(sign(encoded));
  const providedSignature = Buffer.from(signature);
  if (expectedSignature.length !== providedSignature.length || !crypto.timingSafeEqual(providedSignature, expectedSignature)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!["buyer", "admin", "combined"].includes(payload.mode) || payload.expiresAt <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function readCookie(request: Request, name: string) {
  const header = request.headers.cookie;
  if (!header) return undefined;
  return header.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

export function createQrSessionCookie(mode: QrAccessMode, expiresAt = Date.now() + SESSION_MAX_AGE_MS) {
  return encodeSession({ mode, expiresAt });
}

export function getQrSession(request: Request) {
  return decodeSession(readCookie(request, QR_SESSION_COOKIE));
}

export function assertQrSession(request: Request, allowedModes: QrAccessMode[]) {
  const session = getQrSession(request);
  if (!session || !allowedModes.includes(session.mode)) {
    const error = new Error("QRコードからアクセスしてください。");
    error.name = "QrAccessError";
    throw error;
  }
  return session;
}

export function createQrEntryUrl(baseUrl: string, mode: QrAccessMode) {
  return `${baseUrl.replace(/\/$/, "")}/api/qr/access?mode=${mode}&token=${encodeURIComponent(QR_ENTRY_TOKENS[mode])}`;
}

function issueQrSession(response: Response, mode: QrAccessMode) {
  response.cookie(QR_SESSION_COOKIE, encodeSession({ mode, expiresAt: Date.now() + SESSION_MAX_AGE_MS }), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
  });
  response.redirect(`/${modePaths[mode]}`);
}

export function registerQrAccessRoutes(app: Express) {
  app.get("/api/qr/access", (request: Request, response: Response) => {
    const mode = request.query.mode;
    const token = request.query.token;
    const isMode = mode === "buyer" || mode === "admin" || mode === "combined";
    if (!isMode || typeof token !== "string" || token !== QR_ENTRY_TOKENS[mode]) {
      response.status(403).send("QRコードが確認できませんでした。");
      return;
    }
    issueQrSession(response, mode);
  });

  Object.entries(attachedQrPaths).forEach(([path, mode]) => {
    app.get(path, (_request: Request, response: Response) => issueQrSession(response, mode));
  });
}
