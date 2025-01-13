import { Container } from "@spheres/store";
import { clickCount } from "../state";

export const tokenMap: Map<string, Container<any>> = new Map([
  [ "click-count", clickCount ]
])