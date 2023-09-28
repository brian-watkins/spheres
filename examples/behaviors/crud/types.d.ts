import { DataRecord } from "../../src/crud/state.ts"
import { TestApp } from "./helpers/testApp.ts"

export declare global {
  interface Window {
    startApp(data: Array<DataRecord>): void
  }
}