/** Server-side structured logger with daily UTC log file rotation. */
import { createWriteStream, existsSync, mkdirSync, type WriteStream } from "node:fs";
import { inspect } from "node:util";

type LogLevel = "debug" | "info" | "warn" | "error" | "security";

interface LogEntry {
  [key: string]: unknown;
  level: LogLevel;
  message: string;
  timestamp: string;
}

function isDevEnv(env: { readonly DEV?: boolean } | undefined): boolean {
  return Boolean(env?.DEV);
}

const isDevEnvironment = isDevEnv(import.meta.env);

let activeDate = "";
let ensuredDir: string | null = null;
const streams = new Map<LogLevel, WriteStream>();

function getLogDir(): string {
  const configured = process.env["LOG_DIR"]?.trim();
  return configured && configured.length > 0 ? configured : "./logs";
}

function ensureLogDir(logDir: string): void {
  if (ensuredDir === logDir) return;
  if (!existsSync(logDir)) {
    try {
      mkdirSync(logDir, { recursive: true });
    } catch (error) {
      console.error("[Logger] Failed to create log directory:", error);
      return;
    }
  }
  ensuredDir = logDir;
}

function getStream(level: LogLevel, logDir: string): WriteStream {
  const today = new Date().toISOString().split("T", 1)[0] ?? "";
  if (today !== activeDate) {
    for (const stream of streams.values()) {
      stream.end();
    }
    streams.clear();
    activeDate = today;
  }
  const existing = streams.get(level);
  if (existing) return existing;

  const filePath = `${logDir}/${today}-${level}.log`;
  const stream = createWriteStream(filePath, { flags: "a" });
  stream.on("error", (error) => {
    console.error(`[Logger] Stream error for ${level}:`, error);
    ensuredDir = null;
    if (streams.get(level) === stream) {
      streams.delete(level);
    }
  });
  streams.set(level, stream);
  return stream;
}

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify(inspect(value, { depth: 3, breakLength: Infinity }));
  }
}

function formatLogEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const entry: LogEntry = { ...meta, timestamp: new Date().toISOString(), level, message };
  return safeJsonStringify(entry);
}

function writeToFile(level: LogLevel, line: string): void {
  try {
    const logDir = getLogDir();
    ensureLogDir(logDir);
    getStream(level, logDir).write(`${line}\n`);
  } catch (error) {
    console.error("[Logger] Failed to write to log file:", error);
  }
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const details: Record<string, unknown> = {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    };
    if (error.cause !== undefined) {
      details["cause"] = error.cause instanceof Error ? error.cause.message : inspect(error.cause);
    }
    const extra = error as Error & { code?: unknown; responseCode?: unknown; command?: unknown };
    if (extra.code !== undefined) details["errorCode"] = extra.code;
    if (extra.responseCode !== undefined) details["responseCode"] = extra.responseCode;
    if (extra.command !== undefined) details["command"] = extra.command;
    return details;
  }

  if (typeof error === "string" || typeof error === "number" || typeof error === "boolean") {
    return { error: String(error) };
  }

  if (error !== null && error !== undefined) {
    return { error: safeJsonStringify(error) };
  }

  return {};
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (!isDevEnvironment) return;
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
    const line = formatLogEntry("error", message, serializeError(error));
    console.error(line);
    writeToFile("error", line);
  },

  security(message: string, meta?: Record<string, unknown>): void {
    const line = formatLogEntry("security", message, meta);
    console.warn(`[SECURITY] ${line}`);
    writeToFile("security", line);
  },
};

export function sanitizeLogString(value: unknown, maxLength = 512): string {
  return typeof value === "string" ?
      value
        .replaceAll(/[\r\n\0\v\f]+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

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
