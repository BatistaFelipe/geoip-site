import type { IpInfoResponse } from "@/lib/types";

const IPINFO_TIMEOUT_MS = 10_000;
const USER_AGENT = "geoip-site/1.0";

export class IpInfoError extends Error {
  readonly code: "upstream_error" | "rate_limited" | "timeout";

  constructor(
    code: "upstream_error" | "rate_limited" | "timeout",
    message: string,
  ) {
    super(message);
    this.code = code;
    this.name = "IpInfoError";
  }
}

export async function getIpInfo(ip: string): Promise<IpInfoResponse> {
  const token = process.env.IPINFO_TOKEN;
  const url = token
    ? `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${encodeURIComponent(token)}`
    : `https://ipinfo.io/${encodeURIComponent(ip)}/json`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      signal: AbortSignal.timeout(IPINFO_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new IpInfoError("timeout", "ipinfo.io request timed out");
    }
    throw new IpInfoError("upstream_error", "ipinfo.io request failed");
  }

  if (response.status === 429) {
    throw new IpInfoError("rate_limited", "ipinfo.io rate limit reached");
  }

  if (!response.ok) {
    throw new IpInfoError(
      "upstream_error",
      `ipinfo.io returned HTTP ${response.status}`,
    );
  }

  const data = (await response.json()) as IpInfoResponse;
  return data;
}
