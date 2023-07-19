import { Summary } from "esbehavior"
import { PlaywrightDisplayElement } from "./helpers/playwrightDisplayElement.ts"

declare global {
  interface Window {
    validateBehaviors(): Promise<Summary>
    _testDisplayElement(selector: string, at: number, method: keyof PlaywrightDisplayElement, args?: Array<string>): Promise<any>
    _testDisplayElementsCount(selector: string): Promise<number>
    _testDebug(): Promise<boolean>
    _testPatchApp: PatchApp | undefined
  }
}