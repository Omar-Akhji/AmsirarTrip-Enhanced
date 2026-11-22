declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  const component: AstroComponentFactory;
  export default component;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare namespace astroHTML.JSX {
  interface FormHTMLAttributes {
    tooldescription?: string;
    toolname?: string;
  }

  interface InputHTMLAttributes {
    toolparamdescription?: string;
  }
}

declare namespace App {
  interface Locals {
    isApiRateLimitChecked?: boolean;
    isCloudflareVerified?: boolean;
    locale: "en" | "fr" | "de" | "es";
  }
}
