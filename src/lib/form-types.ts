export type FormState =
  | { readonly success: true; readonly message: string; readonly errors?: never }
  | {
      readonly success: false;
      readonly message: string;
      readonly errors?: Readonly<Record<string, string>>;
    };
