import { GetState } from "..";
import { View } from "./vdom";

declare global {
  interface Window {
    esdisplay: { islands: { [key: string]: () => Promise<{ default: (get: GetState) => View }> }}
  }
}