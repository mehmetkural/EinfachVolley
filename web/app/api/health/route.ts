// Simple health check endpoint
// GET /api/health → { status: "ok", timestamp: "..." }
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
  });
}
