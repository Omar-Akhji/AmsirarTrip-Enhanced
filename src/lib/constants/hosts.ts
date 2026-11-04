const isProduction = import.meta.env.PROD;

export const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

export const TRUSTED_HOSTS = new Set([
  "amsirartrip.com",
  "www.amsirartrip.com",
  ...(isProduction ? [] : ["localhost", "127.0.0.1"]),
]);
