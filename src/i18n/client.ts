import type { Locale } from "./locales";
import { clientUi as rawClientUi } from "./client-data";

export type ClientMessages = (typeof rawClientUi)["en"];

export const clientUi = rawClientUi as unknown as Record<Locale, ClientMessages>;
