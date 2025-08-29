import { Container, DerivedState, GetState, collection, container, derived } from "spheres/store";
import { CellError, ParseFailure, UnableToCalculate, cellDefinition } from "./formula";
import { Result } from "./result";

export interface CellDetails {
  cellValue: DerivedState<Result<string, CellError>>
  editable: Container<boolean>
}

export type CellContainer = Container<CellDetails, string>

const cellCollection = collection({
  initialValues: () => container({
    initialValue: {
      cellValue: derived<Result<string, CellError>>({
        query: () => Result.ok("")
      }),
      editable: container({ initialValue: false })
    },
    update: (definition: string, current) => {
      const result = cellDefinition(definition)

      if (result.type === "failure") {
        return {
          value: {
            cellValue: derived<Result<string, CellError>>({
              query: () => Result.err(new ParseFailure(definition))
            }),
            editable: current.editable
          }
        }
      }

      return {
        value: {
          cellValue: derived({
            query: (get) => {
              return result
                .value((identifier) => get(get(cellContainer(get, identifier)).cellValue))
                .mapError<CellError>(() => new UnableToCalculate())
            }
          }),
          editable: current.editable
        }
      }
    }
  })
})

export function cellContainer(get: GetState, id: string): CellContainer {
  return get(cellCollection).get(id)
}
