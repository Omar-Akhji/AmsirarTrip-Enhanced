export const getSecurityHeaders = (nonce: string, host: string) => {
  return [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-XSS-Protection", value: "0" },
    { key: "Referrer-Policy", value: "origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
    },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    {
      key: "Content-Security-Policy",
      value: [
        // Default: self only
        "default-src 'self'",
        // Scripts: nonce + strict-dynamic for Astro view transitions + Google reCAPTCHA
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.google.com https://www.gstatic.com`,
        // Styles: self + inline (Tailwind atomic CSS injection) + Google Fonts
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        // Fonts: self + Google Fonts
        "font-src 'self' https://fonts.gstatic.com",
        // Images: self + blob/data (Astro image optimization) + tripadvisor + Google
        `img-src 'self' blob: data: https://*.tripadvisor.com https://*.tripadvisor.de https://*.google.com https://*.gstatic.com`,
        // Frames: self + Google reCAPTCHA & Maps
        "frame-src 'self' https://www.google.com https://www.google.com/maps/",
        // Connections: self + own API routes (explicit host, no wildcard)
        `connect-src 'self' https://${host}`,
        // Workers: self only (no third-party workers)
        "worker-src 'self'",
        // Web app manifest: self only
        "manifest-src 'self'",
        // Objects/plugins: block all
        "object-src 'none'",
        // Base-URI: restrict to self
        "base-uri 'self'",
        // Form-action: restrict to self
        "form-action 'self'",
      ].join("; "),
    },
  ];
};
