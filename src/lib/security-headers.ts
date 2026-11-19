export interface SecurityHeader {
  readonly key: string;
  readonly value: string;
}

const BASELINE_HEADERS: readonly SecurityHeader[] = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const DOCUMENT_SECURITY_HEADERS: readonly SecurityHeader[] = [
  ...BASELINE_HEADERS,
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "0" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value:
      "autoplay=(), camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  },
];

/** Baseline hardening headers applied to redirects, static assets, and discovery files. */
export function getBaselineSecurityHeaders(): readonly SecurityHeader[] {
  return BASELINE_HEADERS;
}

/**
 * Full document security headers. Content-Security-Policy is generated natively by Astro 7's
 * hash-based `security.csp` config so cached HTML never reuses static nonces or buffers responses.
 */
export function getSecurityHeaders(): readonly SecurityHeader[] {
  return DOCUMENT_SECURITY_HEADERS;
}
