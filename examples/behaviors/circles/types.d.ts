import { FakeCircle } from "./helpers/fakeCircle"
import { TestApp } from "./helpers/testApp.ts"

export declare global {
  interface Window {
    startCircleApp(data: Array<FakeCircle>): void
  }
}