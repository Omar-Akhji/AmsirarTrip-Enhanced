/** Generates a cryptographically random nonce for CSP script tags. */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("base64url");
}
