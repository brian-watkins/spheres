import { Summary } from "esbehavior"
import { TestApp } from "./helpers/testApp.js"

export declare global {
  interface Window {
    esdisplay_testApp: TestApp
  }
}