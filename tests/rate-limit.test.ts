import { getClientIp, rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("allows requests up to the limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("ip-a", 5, 60_000)).toBe(true);
    }
  });

  it("rejects requests over the limit within the window", () => {
    for (let i = 0; i < 5; i++) rateLimit("ip-b", 5, 60_000);
    expect(rateLimit("ip-b", 5, 60_000)).toBe(false);
    expect(rateLimit("ip-b", 5, 60_000)).toBe(false);
  });

  it("re-allows requests after the window slides", () => {
    for (let i = 0; i < 5; i++) rateLimit("ip-c", 5, 60_000);
    expect(rateLimit("ip-c", 5, 60_000)).toBe(false);

    jest.advanceTimersByTime(61_000);

    expect(rateLimit("ip-c", 5, 60_000)).toBe(true);
  });

  it("tracks buckets independently per identifier", () => {
    for (let i = 0; i < 5; i++) rateLimit("ip-d", 5, 60_000);
    expect(rateLimit("ip-d", 5, 60_000)).toBe(false);
    expect(rateLimit("ip-e", 5, 60_000)).toBe(true);
  });
});

describe("getClientIp", () => {
  function makeRequest(headers: Record<string, string>): Request {
    return new Request("http://localhost/x", { headers });
  }

  it("returns the first entry of x-forwarded-for", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = makeRequest({ "x-real-ip": "9.9.9.9" });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("returns 'unknown' when no header is present", () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe("unknown");
  });
});
