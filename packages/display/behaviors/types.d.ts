import { TestApp } from "./helpers/testApp.ts"

export declare global {
  interface Window {
    esdisplay_testApp: TestApp
  }
}