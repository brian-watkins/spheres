import { Summary } from "esbehavior"

declare global {
  interface Window {
    validateBehaviors(): Promise<Summary>
  }
}