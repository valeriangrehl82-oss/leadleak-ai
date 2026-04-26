import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "leadleak_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 12;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || "";
}

export function isAdminPasswordConfigured() {
  return Boolean(getAdminPassword());
}

export function createAdminSessionValue() {
  const password = getAdminPassword();

  if (!password) {
    return "";
  }

  return createHmac("sha256", password).update("leadleak-admin-session").digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isValidAdminPassword(password: string) {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    return false;
  }

  return safeEqual(password, configuredPassword);
}

export function hasValidAdminSession(cookieValue: string | undefined) {
  const sessionValue = createAdminSessionValue();

  if (!cookieValue || !sessionValue) {
    return false;
  }

  return safeEqual(cookieValue, sessionValue);
}
