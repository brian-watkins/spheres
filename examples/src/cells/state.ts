import { Container, DerivedState, container, derived } from "@spheres/store";
import { cellDefinition } from "./formula";
import { Result } from "./result";

export type CellDetails = DerivedState<Result<string, string>>

export type CellContainer = Container<CellDetails, string>

export function cellContainer(id: string): CellContainer {
  return container({
    id,
    initialValue: derived<Result<string, string>>({
      query: () => Result.ok("")
    }),
    reducer: (definition: string) => {
      const result = cellDefinition(definition)

      if (result.type === "failure") {
        return derived({
          query: () => Result.err(definition)
        })
      }

      return derived({
        query: (get) => {
          return result.value((identifier) => get(get(cellContainer(identifier))))
            .mapError(() => definition)
        }
      })
    }
  })
}
