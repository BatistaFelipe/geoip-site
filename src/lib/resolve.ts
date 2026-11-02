import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const DNS_TIMEOUT_MS = 5_000;

export class ResolveError extends Error {
  readonly code: "dns_failed" | "timeout" | "private_ip" | "invalid_input";

  constructor(
    code: "dns_failed" | "timeout" | "private_ip" | "invalid_input",
    message: string,
  ) {
    super(message);
    this.code = code;
    this.name = "ResolveError";
  }
}

export function isValidTarget(target: string): boolean {
  if (!target || target.length > 253) return false;
  return /^[a-zA-Z0-9.:_-]+$/.test(target);
}

function ipv4ToOctets(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    octets.push(n);
  }
  return octets;
}

function isPrivateIpv4(ip: string): boolean {
  const octets = ipv4ToOctets(ip);
  if (!octets) return true;
  const [a, b] = octets;

  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;

  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9")) return true;
  if (normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
  if (normalized.startsWith("ff")) return true;
  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.replace("::ffff:", "");
    if (isIP(mapped) === 4) return isPrivateIpv4(mapped);
  }
  return false;
}

export function isPublicIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return !isPrivateIpv4(ip);
  if (version === 6) return !isPrivateIpv6(ip);
  return false;
}

export async function resolveTarget(target: string): Promise<string> {
  if (isIP(target)) {
    return target;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DNS_TIMEOUT_MS);

  try {
    const result = await Promise.race([
      lookup(target, { all: false }),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () => {
          reject(new ResolveError("timeout", "DNS lookup timed out"));
        });
      }),
    ]);
    return result.address;
  } catch (error: unknown) {
    if (error instanceof ResolveError) throw error;
    throw new ResolveError("dns_failed", `DNS resolution failed for ${target}`);
  } finally {
    clearTimeout(timer);
  }
}
