import { Container } from "@store/index.js";
import { clickCount } from "../state";

export const tokenMap: Map<string, Container<any>> = new Map([
  [ "click-count", clickCount ]
])