jest.mock("@/lib/resolve", () => {
  const actual = jest.requireActual("@/lib/resolve") as typeof import("@/lib/resolve");
  return {
    ...actual,
    resolveTarget: jest.fn(),
  };
});

jest.mock("@/lib/ipinfo", () => {
  const actual = jest.requireActual("@/lib/ipinfo") as typeof import("@/lib/ipinfo");
  return {
    ...actual,
    getIpInfo: jest.fn(),
  };
});

jest.mock("@/lib/rate-limit", () => {
  const actual = jest.requireActual("@/lib/rate-limit") as typeof import("@/lib/rate-limit");
  return {
    ...actual,
    rateLimit: jest.fn(() => true),
  };
});

import { GET } from "@/app/api/lookup/route";
import { getIpInfo, IpInfoError } from "@/lib/ipinfo";
import { rateLimit } from "@/lib/rate-limit";
import { resolveTarget, ResolveError } from "@/lib/resolve";

const mockedResolve = resolveTarget as jest.MockedFunction<typeof resolveTarget>;
const mockedGetIpInfo = getIpInfo as jest.MockedFunction<typeof getIpInfo>;
const mockedRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>;

function makeRequest(url: string, headers: Record<string, string> = {}): Request {
  return new Request(url, { headers });
}

const SAMPLE_INFO = {
  ip: "8.8.8.8",
  hostname: "dns.google",
  city: "Mountain View",
  country: "US",
  org: "AS15169 Google LLC",
};

describe("GET /api/lookup", () => {
  beforeEach(() => {
    mockedRateLimit.mockReturnValue(true);
  });

  it("returns 400 when target query is missing", async () => {
    const res = await GET(makeRequest("http://x/api/lookup"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ ok: false, error: "missing 'target' query parameter" });
  });

  it("returns 400 when target has invalid characters", async () => {
    const res = await GET(makeRequest("http://x/api/lookup?target=bad%20space"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ ok: false, error: "invalid target format" });
  });

  it("returns 400 for private IP targets", async () => {
    mockedResolve.mockResolvedValueOnce("192.168.1.1");

    const res = await GET(makeRequest("http://x/api/lookup?target=192.168.1.1"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/IP range not allowed/);
  });

  it("returns 400 when DNS lookup fails", async () => {
    mockedResolve.mockRejectedValueOnce(new ResolveError("dns_failed", "DNS resolution failed for xyz"));

    const res = await GET(makeRequest("http://x/api/lookup?target=xyz.invalid"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/DNS resolution failed/);
  });

  it("returns 504 when DNS lookup times out", async () => {
    mockedResolve.mockRejectedValueOnce(new ResolveError("timeout", "DNS lookup timed out"));

    const res = await GET(makeRequest("http://x/api/lookup?target=slow.example"));
    expect(res.status).toBe(504);
  });

  it("returns 200 with lookup result on happy path", async () => {
    mockedResolve.mockResolvedValueOnce("8.8.8.8");
    mockedGetIpInfo.mockResolvedValueOnce(SAMPLE_INFO);

    const res = await GET(makeRequest("http://x/api/lookup?target=8.8.8.8"));

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const body = await res.json();
    expect(body).toEqual({
      ok: true,
      data: { ...SAMPLE_INFO, resolvedFrom: "8.8.8.8" },
    });
  });

  it("passes the trimmed target through as resolvedFrom", async () => {
    mockedResolve.mockResolvedValueOnce("8.8.8.8");
    mockedGetIpInfo.mockResolvedValueOnce(SAMPLE_INFO);

    const res = await GET(makeRequest("http://x/api/lookup?target=%20dns.google%20"));
    const body = await res.json();

    expect(body.data.resolvedFrom).toBe("dns.google");
  });

  it("returns 429 when the local rate limit rejects", async () => {
    mockedRateLimit.mockReturnValueOnce(false);

    const res = await GET(makeRequest("http://x/api/lookup?target=8.8.8.8"));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/rate limit/);
  });

  it("returns 429 when ipinfo signals rate_limited", async () => {
    mockedResolve.mockResolvedValueOnce("8.8.8.8");
    mockedGetIpInfo.mockRejectedValueOnce(
      new IpInfoError("rate_limited", "ipinfo.io rate limit reached"),
    );

    const res = await GET(makeRequest("http://x/api/lookup?target=8.8.8.8"));
    expect(res.status).toBe(429);
  });

  it("returns 502 on ipinfo upstream errors", async () => {
    mockedResolve.mockResolvedValueOnce("8.8.8.8");
    mockedGetIpInfo.mockRejectedValueOnce(
      new IpInfoError("upstream_error", "ipinfo.io returned HTTP 500"),
    );

    const res = await GET(makeRequest("http://x/api/lookup?target=8.8.8.8"));
    expect(res.status).toBe(502);
  });

  it("returns 504 on ipinfo timeout", async () => {
    mockedResolve.mockResolvedValueOnce("8.8.8.8");
    mockedGetIpInfo.mockRejectedValueOnce(new IpInfoError("timeout", "ipinfo.io request timed out"));

    const res = await GET(makeRequest("http://x/api/lookup?target=8.8.8.8"));
    expect(res.status).toBe(504);
  });
});
