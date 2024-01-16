import { Container, DerivedState, container, derived } from "@spheres/store";
import { cellDefinition } from "./formula";

export type CellContainer = Container<DerivedState<string | number>, string>

export function cellContainer(id: string): CellContainer {
  return container({
    id,
    initialValue: derived<string | number>({
      query: () => ""
    }),
    reducer: (definition: string) => {
      const result = cellDefinition(definition)

      if (result.type === "failure") {
        throw new Error("parse-failure")
      }

      return derived({
        query: (get) => result.value((identifier) => get(get(cellContainer(identifier))))
      })
    }
  })
}
