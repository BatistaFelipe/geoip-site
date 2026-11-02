export interface IpInfoResponse {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
}

export interface LookupResult extends IpInfoResponse {
  resolvedFrom: string;
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type LookupErrorCode =
  | "invalid_input"
  | "dns_failed"
  | "private_ip"
  | "upstream_error"
  | "rate_limited"
  | "timeout"
  | "unknown";
