/** Server utilities — re-exports from services and HTML escape utility. */

export { getMailer } from "@/services/email";
export { logger, logSecurityEvent } from "@/services/logger";

export function escapeHtml(string_ = ""): string {
  return string_
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
