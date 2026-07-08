/**
 * Generates a cryptographically random nonce for CSP script tags. Uses `crypto.getRandomValues`
 * which is available in all modern environments.
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const encoding: BufferEncoding = "base64";
  return Buffer.from(array)
    .toString(encoding)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
