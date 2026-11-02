import { getIpInfo, IpInfoError } from "@/lib/ipinfo";

const SAMPLE_RESPONSE = {
  ip: "8.8.8.8",
  hostname: "dns.google",
  city: "Mountain View",
  region: "California",
  country: "US",
  loc: "37.4056,-122.0775",
  org: "AS15169 Google LLC",
  postal: "94043",
  timezone: "America/Los_Angeles",
};

function okResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("getIpInfo", () => {
  const originalFetch = global.fetch;
  const originalToken = process.env.IPINFO_TOKEN;

  beforeEach(() => {
    delete process.env.IPINFO_TOKEN;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalToken === undefined) {
      delete process.env.IPINFO_TOKEN;
    } else {
      process.env.IPINFO_TOKEN = originalToken;
    }
  });

  it("fetches ipinfo.io without a token and returns parsed JSON", async () => {
    const fetchMock = jest.fn().mockResolvedValue(okResponse(SAMPLE_RESPONSE));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await getIpInfo("8.8.8.8");

    expect(result).toEqual(SAMPLE_RESPONSE);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://ipinfo.io/8.8.8.8/json");
    expect(init.headers).toMatchObject({
      Accept: "application/json",
      "User-Agent": "geoip-site/1.0",
    });
  });

  it("appends the token to the query string when IPINFO_TOKEN is set", async () => {
    process.env.IPINFO_TOKEN = "secret-token";
    const fetchMock = jest.fn().mockResolvedValue(okResponse(SAMPLE_RESPONSE));
    global.fetch = fetchMock as unknown as typeof fetch;

    await getIpInfo("1.1.1.1");

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("https://ipinfo.io/1.1.1.1/json?token=secret-token");
  });

  it("throws rate_limited on HTTP 429", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response("rate limit", { status: 429 }),
    ) as unknown as typeof fetch;

    await expect(getIpInfo("1.1.1.1")).rejects.toMatchObject({
      name: "IpInfoError",
      code: "rate_limited",
    });
  });

  it("throws upstream_error on other non-2xx HTTP", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response("boom", { status: 500 }),
    ) as unknown as typeof fetch;

    await expect(getIpInfo("1.1.1.1")).rejects.toBeInstanceOf(IpInfoError);
    await expect(getIpInfo("1.1.1.1")).rejects.toMatchObject({
      code: "upstream_error",
    });
  });

  it("throws timeout when fetch raises a TimeoutError", async () => {
    const err = new Error("timed out");
    err.name = "TimeoutError";
    global.fetch = jest.fn().mockRejectedValue(err) as unknown as typeof fetch;

    await expect(getIpInfo("1.1.1.1")).rejects.toMatchObject({
      code: "timeout",
    });
  });

  it("throws upstream_error on network failure", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("ECONNRESET")) as unknown as typeof fetch;

    await expect(getIpInfo("1.1.1.1")).rejects.toMatchObject({
      code: "upstream_error",
    });
  });
});
