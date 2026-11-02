import { isPublicIp, isValidTarget, ResolveError, resolveTarget } from "@/lib/resolve";

jest.mock("node:dns/promises", () => ({
  lookup: jest.fn(),
}));

import { lookup } from "node:dns/promises";

const mockedLookup = lookup as jest.MockedFunction<typeof lookup>;

describe("isValidTarget", () => {
  it.each([
    ["8.8.8.8"],
    ["cloudflare.com"],
    ["dns.google"],
    ["example-site_01.net"],
    ["2001:4860:4860::8888"],
  ])("accepts %s", (input) => {
    expect(isValidTarget(input)).toBe(true);
  });

  it.each([
    [""],
    ["   "],
    ["has space.com"],
    ["bad|char.com"],
    ["semi;colon.com"],
    ["a".repeat(254)],
  ])("rejects %s", (input) => {
    expect(isValidTarget(input)).toBe(false);
  });
});

describe("isPublicIp", () => {
  it.each([
    ["8.8.8.8"],
    ["1.1.1.1"],
    ["93.184.216.34"],
    ["203.0.113.1"],
    ["2001:4860:4860::8888"],
  ])("accepts public IP %s", (ip) => {
    expect(isPublicIp(ip)).toBe(true);
  });

  it.each([
    ["10.0.0.1"],
    ["10.255.255.254"],
    ["172.16.0.1"],
    ["172.31.255.255"],
    ["192.168.1.1"],
    ["127.0.0.1"],
    ["169.254.1.1"],
    ["0.0.0.0"],
    ["100.64.0.1"],
    ["100.127.255.255"],
    ["224.0.0.1"],
    ["240.0.0.1"],
    ["255.255.255.255"],
  ])("rejects private IPv4 %s", (ip) => {
    expect(isPublicIp(ip)).toBe(false);
  });

  it.each([
    ["::"],
    ["::1"],
    ["fc00::"],
    ["fd12:3456::1"],
    ["fe80::1"],
    ["ff00::1"],
    ["::ffff:192.168.1.1"],
  ])("rejects private IPv6 %s", (ip) => {
    expect(isPublicIp(ip)).toBe(false);
  });

  it("rejects IPv4 outside allowed public range (172.17 IS inside 172.16/12, so pick 172.32)", () => {
    expect(isPublicIp("172.32.0.1")).toBe(true);
    expect(isPublicIp("172.15.0.1")).toBe(true);
  });

  it("rejects non-IP strings", () => {
    expect(isPublicIp("not-an-ip")).toBe(false);
    expect(isPublicIp("")).toBe(false);
  });
});

describe("resolveTarget", () => {
  it("returns IPv4 target unchanged when input is already an IP", async () => {
    await expect(resolveTarget("8.8.8.8")).resolves.toBe("8.8.8.8");
    expect(mockedLookup).not.toHaveBeenCalled();
  });

  it("returns IPv6 target unchanged when input is already an IP", async () => {
    await expect(resolveTarget("2001:db8::1")).resolves.toBe("2001:db8::1");
    expect(mockedLookup).not.toHaveBeenCalled();
  });

  it("resolves hostnames via dns.lookup", async () => {
    mockedLookup.mockResolvedValueOnce({ address: "93.184.216.34", family: 4 });

    await expect(resolveTarget("example.com")).resolves.toBe("93.184.216.34");
    expect(mockedLookup).toHaveBeenCalledWith("example.com", { all: false });
  });

  it("throws ResolveError when DNS lookup fails", async () => {
    mockedLookup.mockRejectedValueOnce(new Error("ENOTFOUND"));

    await expect(resolveTarget("nope.invalid")).rejects.toBeInstanceOf(ResolveError);
    await expect(resolveTarget("nope.invalid")).rejects.toMatchObject({
      code: "dns_failed",
    });
  });
});
