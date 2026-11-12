import { navigate } from "astro:transitions/client";
import { getLocalizedPath } from "@/i18n/core";
import { isLocale } from "@/i18n/locales";

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
}

declare global {
  interface Navigator {
    readonly modelContext?: {
      readonly registerTool: (
        definition: ToolDefinition,
        handler: (input: Record<string, unknown>) => Promise<unknown>,
      ) => void;
    };
  }
}

function initWebMCPTools() {
  const modelContext = navigator.modelContext;
  if (!modelContext) return;

  try {
    modelContext.registerTool(
      {
        name: "toggle_dark_theme",
        description: "Toggles the website theme between light and dark mode",
        inputSchema: {
          type: "object",
          properties: {
            dark: {
              type: "boolean",
              description: "True to enable dark mode, false for light mode",
            },
          },
          required: ["dark"],
        },
      },
      async (input) => {
        await Promise.resolve();
        const dark = Boolean(input["dark"]);
        document.documentElement.classList.toggle("dark", dark);
        return { success: true, currentTheme: dark ? "dark" : "light" };
      },
    );

    modelContext.registerTool(
      {
        name: "change_locale",
        description: "Changes the website locale/language with smooth Astro view transitions",
        inputSchema: {
          type: "object",
          properties: {
            locale: {
              type: "string",
              enum: ["en", "fr", "de", "es"],
              description: "The locale code to switch to",
            },
          },
          required: ["locale"],
        },
      },
      async (input) => {
        const localeInput = String(input["locale"]).trim();
        if (!isLocale(localeInput)) {
          return { success: false, error: "Unsupported locale" };
        }
        const newPath = getLocalizedPath(globalThis.location.pathname, localeInput);
        await navigate(newPath);
        return { success: true, targetPath: newPath };
      },
    );

    modelContext.registerTool(
      {
        name: "navigate_to",
        description:
          "Navigates to any website route (e.g. '/', '/tours', '/excursions', '/about', '/contact') using smooth Astro view transitions",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "The internal path to navigate to, starting with /",
            },
          },
          required: ["path"],
        },
      },
      async (input) => {
        const path = String(input["path"]).trim();
        if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
          return { success: false, error: "Path must be a valid internal relative path" };
        }
        const resolved = new URL(path, globalThis.location.origin);
        if (resolved.origin !== globalThis.location.origin) {
          return { success: false, error: "Cross-origin navigation is forbidden" };
        }
        await navigate(resolved.pathname + resolved.search + resolved.hash);
        return { success: true, targetPath: resolved.pathname };
      },
    );

    modelContext.registerTool(
      {
        name: "get_page_context",
        description:
          "Returns metadata for the current page including route, title, language, and theme",
        inputSchema: { type: "object", properties: {} },
      },
      async () => {
        await Promise.resolve();
        return {
          success: true,
          pathname: globalThis.location.pathname,
          title: document.title,
          locale: document.documentElement.lang || "en",
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
        };
      },
    );
  } catch (error) {
    console.error("Failed to register WebMCP tools:", error);
  }
}

if (typeof navigator !== "undefined" && Object.hasOwn(navigator, "modelContext")) {
  initWebMCPTools();
}
