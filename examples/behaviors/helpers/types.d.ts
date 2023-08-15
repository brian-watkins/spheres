import { Clock } from "@sinonjs/fake-timers"
import { TestApp } from "./helpers/testApp.ts"

export declare global {
  interface Window {
    __testClock: Clock
  }
}