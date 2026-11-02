import { NextResponse } from "next/server";
import { getIpInfo, IpInfoError } from "@/lib/ipinfo";
import {
  isPublicIp,
  isValidTarget,
  resolveTarget,
  ResolveError,
} from "@/lib/resolve";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import type { ApiResponse, LookupResult } from "@/lib/types";

function json<T>(body: ApiResponse<T>, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request): Promise<NextResponse> {
  const clientIp = getClientIp(request);
  if (!rateLimit(clientIp)) {
    return json({ ok: false, error: "rate limit exceeded, try again shortly" }, 429);
  }

  const { searchParams } = new URL(request.url);
  const rawTarget = searchParams.get("target");

  if (!rawTarget) {
    return json({ ok: false, error: "missing 'target' query parameter" }, 400);
  }

  const target = rawTarget.trim();
  if (!isValidTarget(target)) {
    return json({ ok: false, error: "invalid target format" }, 400);
  }

  let ip: string;
  try {
    ip = await resolveTarget(target);
  } catch (error: unknown) {
    if (error instanceof ResolveError) {
      const status = error.code === "timeout" ? 504 : 400;
      return json({ ok: false, error: error.message }, status);
    }
    return json({ ok: false, error: "failed to resolve target" }, 500);
  }

  if (!isPublicIp(ip)) {
    return json(
      { ok: false, error: `IP range not allowed: ${ip}` },
      400,
    );
  }

  try {
    const info = await getIpInfo(ip);
    const result: LookupResult = { ...info, resolvedFrom: target };
    return json({ ok: true, data: result }, 200);
  } catch (error: unknown) {
    if (error instanceof IpInfoError) {
      const status =
        error.code === "rate_limited"
          ? 429
          : error.code === "timeout"
            ? 504
            : 502;
      return json({ ok: false, error: error.message }, status);
    }
    return json({ ok: false, error: "unexpected error" }, 500);
  }
}
