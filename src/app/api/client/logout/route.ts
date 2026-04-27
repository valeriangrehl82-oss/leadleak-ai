import { NextResponse } from "next/server";
import { CLIENT_COOKIE_NAME } from "@/lib/clientSession";

function logout(request: Request) {
  const response = NextResponse.redirect(new URL("/client/login", request.url), { status: 303 });
  response.cookies.set({
    name: CLIENT_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/client",
    maxAge: 0,
  });

  return response;
}

export function GET(request: Request) {
  return logout(request);
}

export function POST(request: Request) {
  return logout(request);
}
