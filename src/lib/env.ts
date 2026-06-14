import { GMAIL_PASS, GMAIL_USER, MAIL_TO, RECAPTCHA_SECRET_KEY } from "astro:env/server";

export const env = {
  get GMAIL_USER() {
    return GMAIL_USER;
  },
  get GMAIL_PASS() {
    return GMAIL_PASS;
  },
  get RECAPTCHA_SECRET_KEY() {
    return RECAPTCHA_SECRET_KEY || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
  },
  get MAIL_TO() {
    return MAIL_TO || "";
  },
} as const;
