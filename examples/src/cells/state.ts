import { Container, Value, container, value } from "@spheres/store";
import { cellDefinition } from "./parser"

const cells: Map<string, Container<Value<string | number>, string>> = new Map()

export function cellContainer(id: string): Container<Value<string | number>, string> {
  let cell = cells.get(id)
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
          query: result.context.formula ?? (() => result.value)
        })
      }
    })
    cells.set(id, cell)
  }
  return cell
}
