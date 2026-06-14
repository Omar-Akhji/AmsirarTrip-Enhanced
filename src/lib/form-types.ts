export type FormState = { success: boolean; message: string; errors?: Record<string, string> };

const GENERIC_ERROR = "An unexpected error occurred. Please try again.";

export function createErrorResponse(error: unknown, context: string): FormState {
  console.error(`${context} error:`, error);
  return { success: false, message: GENERIC_ERROR };
}
