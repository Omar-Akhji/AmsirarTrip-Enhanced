/// <reference types="astro/client" />

declare module "*.astro" {
  const component: (props: Record<string, unknown>) => unknown;
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
    isCloudflareVerified: boolean;
    locale: "en" | "fr" | "de" | "es";
  }
}
