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
    registerTool(
      definition: ToolDefinition,
      handler: (input: Record<string, unknown>) => Promise<unknown>,
    ): void;
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
        description:
          "Changes the website locale/language by navigating to the corresponding page prefix",
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
        const hasLocale = locales.includes(segments[0] || "");

        let newPath = "";
        if (localeInput === "en") {
          newPath = "/" + (hasLocale ? segments.slice(1).join("/") : segments.join("/"));
        } else {
          const baseSegments = hasLocale ? segments.slice(1) : segments;
          newPath = "/" + localeInput + "/" + baseSegments.join("/");
        }

        newPath = newPath.replaceAll(/\/+/g, "/");
        if (!newPath.startsWith("/")) newPath = "/" + newPath;

        globalThis.location.assign(newPath);
        return { success: true, targetPath: newPath };
      },
    );
  } catch (error) {
    console.error("Failed to register WebMCP tools:", error);
  }
}

if (typeof navigator !== "undefined" && Object.hasOwn(navigator, "modelContext")) {
  initWebMCPTools();
}
