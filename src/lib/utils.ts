import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Route error components receive `unknown`, since anything can be thrown
export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
