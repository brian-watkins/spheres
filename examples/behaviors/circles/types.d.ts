import { Circle } from "../../src/circles/state"
import { TestApp } from "./helpers/testApp.ts"

export declare global {
  interface Window {
    startCircleApp(data: Array<Circle>): void
  }
}