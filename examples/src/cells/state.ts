import { Container, Value, container, value } from "@spheres/store";
import { cellDefinition } from "./parser"

export type CellContainer = Container<Value<string | number>, string>

const cells: Map<string, CellContainer> = new Map()

export function cellContainer(id: string, cellCollection: Map<string, CellContainer> = cells): CellContainer {
  let cell = cellCollection.get(id)
  if (!cell) {
    cell = container({
      initialValue: value<string | number>({
        query: () => ""
      }),
      reducer: (definition: string) => {
        const result = cellDefinition(definition)

        if (result.type === "failure") {
          throw new Error("parse-failure")
        }

        return value({
          query: (get) => result.value((identifier) => get(get(cellContainer(identifier, cellCollection))))
        })
      }
    })
    cellCollection.set(id, cell)
  }
  return cell
}
