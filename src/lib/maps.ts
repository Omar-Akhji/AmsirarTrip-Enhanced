export function isTrustedGoogleMapsEmbedUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.protocol === "https:"
      && parsed.hostname === "www.google.com"
      && (parsed.pathname === "/maps" || parsed.pathname.startsWith("/maps/embed"))
    );
  } catch {
    return false;
  }
}
