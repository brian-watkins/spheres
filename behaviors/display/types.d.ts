import { Summary } from "esbehavior"
import { TestApp } from "./helpers/testApp"

export declare global {
  interface Window {
    esdisplay_testApp: TestApp
  }
}