const isProduction = import.meta.env.PROD;

export const TRUSTED_HOSTS = new Set([
  "amsirartrip.com",
  "www.amsirartrip.com",
  ...(isProduction ? [] : ["localhost", "127.0.0.1"]),
]);
