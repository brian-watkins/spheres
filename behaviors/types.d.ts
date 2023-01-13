import { Summary } from "esbehavior"

export declare global {
  interface Window {
    validateBehaviors(): Promise<Summary>
  }
}