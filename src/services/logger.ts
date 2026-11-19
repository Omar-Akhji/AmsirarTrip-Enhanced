/**
 * Server-side logging service with file output. Logs security events and errors to structured log
 * files.
 */
import { createWriteStream, existsSync, mkdirSync, type WriteStream } from "node:fs";

const disk = { exists: existsSync, mkdir: mkdirSync, createStream: createWriteStream };

type LogLevel = "debug" | "info" | "warn" | "error" | "security";

interface LogEntry {
  [key: string]: unknown;
  level: LogLevel;
  message: string;
  timestamp: string;
}

const LOG_DIR = process.env["LOG_DIR"] ?? "./logs";

let activeDate = "";
const streams = new Map<LogLevel, WriteStream>();

function ensureLogDir() {
  if (!disk.exists(LOG_DIR)) {
    try {
      disk.mkdir(LOG_DIR, { recursive: true });
    } catch (error) {
      console.error("[Logger] Failed to create log directory:", error);
    }
  }
}

// Get or create a write stream for the given level, rotating cleanly when the UTC date changes
function getStream(level: LogLevel): WriteStream {
  const today = new Date().toISOString().split("T", 1)[0] ?? "";
  if (today !== activeDate) {
    for (const stream of streams.values()) {
      stream.end();
    }
    streams.clear();
    activeDate = today;
  }
  const existing = streams.get(level);
  if (existing) {
    return existing;
  }
  const filePath = `${LOG_DIR}/${today}-${level}.log`;
  const stream = disk.createStream(filePath, { flags: "a" });
  stream.on("error", (error) => {
    console.error(`[Logger] Stream error for ${level}:`, error);
    if (streams.get(level) === stream) {
      streams.delete(level);
    }
  });
  streams.set(level, stream);
  return stream;
}

function formatLogEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const entry: LogEntry = { ...meta, timestamp: new Date().toISOString(), level, message };
  return JSON.stringify(entry);
}

function writeToFile(level: LogLevel, line: string) {
  try {
    ensureLogDir();
    getStream(level).write(`${line}\n`);
  } catch (error) {
    console.error("[Logger] Failed to write to log file:", error);
  }
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    const line = formatLogEntry("debug", message, meta);
    console.info(line);
    writeToFile("debug", line);
  },

  info(message: string, meta?: Record<string, unknown>): void {
    const line = formatLogEntry("info", message, meta);
    console.info(line);
    writeToFile("info", line);
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    const line = formatLogEntry("warn", message, meta);
    console.warn(line);
    writeToFile("warn", line);
  },

  error(message: string, error?: unknown): void {
    const errorMeta: Record<string, unknown> = {};
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

  security(message: string, meta?: Record<string, unknown>): void {
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
    ...extra,
    ip: sanitizeLogString(ip, 64),
    type,
    details: sanitizeLogString(details, 512),
    userAgent: sanitizeLogString(extra?.["userAgent"], 512),
  });
}
