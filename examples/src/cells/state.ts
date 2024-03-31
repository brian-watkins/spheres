import { Container, DerivedState, container, derived } from "@spheres/store";
import { CellError, ParseFailure, UnableToCalculate, cellDefinition } from "./formula";
import { Result } from "./result";

export type CellDetails = DerivedState<Result<string, CellError>>

export type CellContainer = Container<CellDetails, string>

export function cellContainer(id: string): CellContainer {
  return container({
    id,
    initialValue: derived<Result<string, CellError>>({
      query: () => Result.ok("")
    }),
    update: (definition: string) => {
      const result = cellDefinition(definition)

      if (result.type === "failure") {
        return {
          value: derived<Result<string, CellError>>({
            query: () => Result.err(new ParseFailure(definition))
          })
        }
      }

      return {
        value: derived({
          query: (get) => {
            return result.value((identifier) => get(get(cellContainer(identifier))))
              .mapError<CellError>(() => new UnableToCalculate())
          }
        })
      }
    }
  })
}
