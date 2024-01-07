import { Container, Value, container, value } from "@spheres/store";
import { cellDefinition } from "./formula";

export type CellContainer = Container<Value<string | number>, string>

export function cellContainer(id: string): CellContainer {
  return container({
    id,
    initialValue: value<string | number>({
      query: () => ""
    }),
    reducer: (definition: string) => {
      const result = cellDefinition(definition)

      if (result.type === "failure") {
        throw new Error("parse-failure")
      }

      return value({
        query: (get) => result.value((identifier) => get(get(cellContainer(identifier))))
      })
    }
  })
}
