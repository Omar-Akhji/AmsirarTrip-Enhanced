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

declare namespace App {
  interface Locals {
    cspNonce: string;
    locale: "en" | "fr" | "de" | "es";
  }
}
