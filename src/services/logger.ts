/**
 * Server-side logging service with file output. Logs security events and errors to structured log
 * files.
 *
 * Features:
 *
 * - Structured JSON logging for easy parsing
 * - Separate log files for different log levels
 * - Automatic log rotation by date
 * - Configurable log directory
 */
import { existsSync, mkdirSync } from "node:fs";
import { createWriteStream, type WriteStream } from "node:fs";

const disk = { exists: existsSync, mkdir: mkdirSync, createStream: createWriteStream };

type LogLevel = "debug" | "info" | "warn" | "error" | "security";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

const LOG_DIR = process.env["LOG_DIR"] ?? "./logs";

let activeDate = "";
const streams: Partial<Record<LogLevel, WriteStream>> = {};

function ensureLogDir() {
  if (!disk.exists(LOG_DIR)) {
    try {
      disk.mkdir(LOG_DIR, { recursive: true });
    } catch (error) {
      console.error("[Logger] Failed to create log directory:", error);
    }
  }
}

// Get or create a write stream for the given level, rotating when the date changes
function getStream(level: LogLevel): WriteStream {
  const today = new Date().toISOString().split("T", 1)[0] ?? "";
  if (today !== activeDate) {
    // Close stale streams from a previous day
    for (const s of Object.values(streams)) s.end();
    activeDate = today;
  }
  if (!streams[level]) {
    const filePath = `${LOG_DIR}/${today}-${level}.log`;
    streams[level] = disk.createStream(filePath, { flags: "a" });
  }
  return streams[level];
}

function formatLogEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const entry: LogEntry = { timestamp: new Date().toISOString(), level, message, ...meta };
  return JSON.stringify(entry);
}

const isServerless = Boolean(process.env["VERCEL"] ?? process.env["AWS_LAMBDA_FUNCTION_NAME"]);

function writeToFile(level: LogLevel, line: string) {
  if (isServerless) return;
  try {
    ensureLogDir();
    getStream(level).write(`${line}\n`);
  } catch (error) {
    console.error("[Logger] Failed to write to log file:", error);
  }
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    const line = formatLogEntry("debug", message, meta);
    console.info(line);
    writeToFile("debug", line);
  },

  info(message: string, meta?: Record<string, unknown>) {
    const line = formatLogEntry("info", message, meta);
    console.info(line);
    writeToFile("info", line);
  },

  warn(message: string, meta?: Record<string, unknown>) {
    const line = formatLogEntry("warn", message, meta);
    console.warn(line);
    writeToFile("warn", line);
  },

  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    const errorMeta: Record<string, unknown> = { ...meta };
    if (error instanceof Error) {
      errorMeta["errorName"] = error.name;
      errorMeta["errorMessage"] = error.message;
      errorMeta["stack"] = error.stack;
    } else if (
      typeof error === "string"
      || typeof error === "number"
      || typeof error === "boolean"
    ) {
      errorMeta["error"] = String(error);
    } else if (error !== null && error !== undefined) {
      errorMeta["error"] = JSON.stringify(error);
    }

    const line = formatLogEntry("error", message, errorMeta);
    console.error(line);
    writeToFile("error", line);
  },

  security(message: string, meta?: Record<string, unknown>) {
    const line = formatLogEntry("security", message, meta);
    // Always log to console for security events (so they're visible in production)
    console.warn(`[SECURITY] ${line}`);
    writeToFile("security", line);
  },
};

function sanitizeLogString(value: unknown, maxLength = 512): string {
  return typeof value === "string" ?
      value
        .replaceAll(/[\r\n\0\v\f]+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

/** Log a security event (rate limit violations, suspicious activity, etc.) */
export function logSecurityEvent(
  type: "RATE_LIMIT" | "BLOCKED_IP" | "HONEYPOT" | "CAPTCHA_FAILED" | "SUSPICIOUS",
  ip: string,
  details: string,
  extra?: Record<string, unknown>,
): void {
  logger.security(`Security event: ${type}`, {
    ip: sanitizeLogString(ip, 64),
    type,
    details: sanitizeLogString(details, 512),
    userAgent: sanitizeLogString(extra?.["userAgent"], 512),
    ...extra,
  });
}
