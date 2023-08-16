import { TestRepeater } from "../timer/testRepeater.ts"

export declare global {
  interface Window {
    __testRepeater: TestRepeater
  }
}