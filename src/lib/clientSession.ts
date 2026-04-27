import { createHmac, timingSafeEqual } from "crypto";

export const CLIENT_COOKIE_NAME = "leadleak_client";
export const CLIENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type ClientSessionPayload = {
  clientId: string;
  exp: number;
};

function getClientPortalSecret() {
  return process.env.CLIENT_PORTAL_SECRET?.trim() || "";
}

function requireClientPortalSecret() {
  const secret = getClientPortalSecret();

  if (!secret) {
    throw new Error("CLIENT_PORTAL_SECRET fehlt.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", requireClientPortalSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashClientAccessCode(accessCode: string) {
  return createHmac("sha256", requireClientPortalSecret()).update(accessCode.trim()).digest("hex");
}

export function verifyClientAccessCode(accessCode: string, storedHash: string | null) {
  if (!storedHash) {
    return false;
  }

  const submittedHash = hashClientAccessCode(accessCode);
  return safeEqual(submittedHash, storedHash);
}

export function createClientSessionValue(clientId: string) {
  const payload: ClientSessionPayload = {
    clientId,
    exp: Math.floor(Date.now() / 1000) + CLIENT_COOKIE_MAX_AGE,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function readClientSessionValue(cookieValue: string | undefined) {
  if (!cookieValue) {
    return null;
  }

  const [encodedPayload, signature] = cookieValue.split(".");

  if (!encodedPayload || !signature || !safeEqual(sign(encodedPayload), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as ClientSessionPayload;

    if (!payload.clientId || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isClientPortalConfigError(error: unknown): error is Error {
  return error instanceof Error && error.message === "CLIENT_PORTAL_SECRET fehlt.";
}
