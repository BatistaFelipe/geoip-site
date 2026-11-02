const DEFAULT_LIMIT = 20;
const DEFAULT_WINDOW_MS = 60_000;

const buckets = new Map<string, number[]>();

export function rateLimit(
  identifier: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS,
): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;

  const timestamps = buckets.get(identifier) ?? [];
  const recent = timestamps.filter((ts) => ts > cutoff);

  if (recent.length >= limit) {
    buckets.set(identifier, recent);
    return false;
  }

  recent.push(now);
  buckets.set(identifier, recent);
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
