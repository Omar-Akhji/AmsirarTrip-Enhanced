import { navigate } from "astro:transitions/client";

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
}

interface NavigatorWithModelContext extends Navigator {
  modelContext?: {
    registerTool: (
      definition: ToolDefinition,
      handler: (input: Record<string, unknown>) => Promise<unknown>,
    ) => void;
  };
}

function initWebMCPTools() {
  const nav = navigator as NavigatorWithModelContext;
  if (!nav.modelContext) return;

  try {
    nav.modelContext.registerTool(
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
        const dark = Boolean(input["dark"]);
        document.documentElement.classList.toggle("dark", dark);
        return { success: true, currentTheme: dark ? "dark" : "light" };
      },
    );

    nav.modelContext.registerTool(
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
        const localeInput = String(input["locale"]);
        const currentPath = globalThis.location.pathname;
        const segments = currentPath.split("/").filter(Boolean);
        const locales = ["fr", "de", "es"];
        const hasLocale = locales.includes(segments[0] ?? "");

        let newPath = "";
        if (localeInput === "en") {
          newPath = `/${hasLocale ? segments.slice(1).join("/") : segments.join("/")}`;
        } else {
          const baseSegments = hasLocale ? segments.slice(1) : segments;
          newPath = `/${localeInput}/${baseSegments.join("/")}`;
        }

        newPath = newPath.replaceAll(/\/+/g, "/");
        if (!newPath.startsWith("/")) newPath = `/${newPath}`;

        await navigate(newPath);
        return { success: true, targetPath: newPath };
      },
    );

    nav.modelContext.registerTool(
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
        if (!path.startsWith("/")) {
          return { success: false, error: "Path must start with '/'" };
        }
        await navigate(path);
        return { success: true, targetPath: path };
      },
    );

    nav.modelContext.registerTool(
      {
        name: "get_page_context",
        description:
          "Returns metadata for the current page including route, title, language, and theme",
        inputSchema: { type: "object", properties: {} },
      },
      async () => {
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
