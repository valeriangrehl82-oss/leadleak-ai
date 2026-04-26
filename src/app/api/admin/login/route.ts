import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  createAdminSessionValue,
  isValidAdminPassword,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  let password = "";

  try {
    const body = await request.json();
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminSessionValue(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });

  return response;
}
