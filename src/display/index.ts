import { loop, State } from "../index.js";
import { Display } from "./display.js";
import { View, stateful } from "./view.js";

export * from "./view.js"
export * from "./display.js"
export * from "./render.js"

export function display(view: View): Display {
  return new Display(loop(), view)
}

export function withState(generator: (get: <S>(state: State<S>) => S) => View): View {
  const stateDerivation = loop().deriveContainer(generator)
  return stateful(stateDerivation.state, stateDerivation.initialValue.key)
}
