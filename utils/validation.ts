import { ZodError } from 'zod';

// Function to format Zod errors
export function formatZodErrors(error: ZodError): { error: string[] } {
  return {
    error: error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
  };
}
