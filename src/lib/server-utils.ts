/** Server utilities — re-exports from services and HTML escape utility. */

export { escapeHtml } from "@/actions/helpers/form-helpers";
export { getMailer, sendTransactionalEmail, verifyMailer } from "@/services/email";
export { logger, logSecurityEvent } from "@/services/logger";
