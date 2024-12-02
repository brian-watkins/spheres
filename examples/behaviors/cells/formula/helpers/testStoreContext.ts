import { createStore, GetState, ReactiveEffect, write } from "spheres/store";
import { Context } from "best-behavior";
import { CellContainer, cellContainer } from "../../../../src/cells/state";
import { Result } from "../../../../src/cells/result";
import { CellError, ParseFailure } from "../../../../src/cells/formula";

export function testStoreContext(): Context<TestStore> {
  return {
    init: () => new TestStore()
  }
}

class CellValueEffect implements ReactiveEffect {
  cellValue!: Result<string, CellError>

  constructor(private cell: CellContainer) { }

  run(get: GetState): void {
    try {
      this.cellValue = get(get(this.cell).cellValue)
    } catch (err) {
      console.log("Erro", err)
      throw err
    }
  }
}

export class TestStore {
  private store = createStore()
  private cellValues = new Map<string, CellValueEffect>()

  defineCell(id: string, definition: string) {
    const cell = cellContainer(id)
    this.store.dispatch(write(cell, definition))
    const effect = new CellValueEffect(cell)
    this.cellValues.set(id, effect)
    this.store.useEffect(effect)
  }

  updateCell(id: string, value: string) {
    const cell = cellContainer(id)
    this.store.dispatch(write(cell, value))
  }

  getCellValue(id: string): string {
    return this.cellValues.get(id)?.cellValue.withDefault("<ERROR IN CELL>") ?? "<UNDEFINED CELL>"
  }

  getCellResult(id: string): Result<string, CellError> {
    return this.cellValues.get(id)?.cellValue ?? Result.err(new ParseFailure("Undefined Cell"))
  }

  printall() {
    console.log("cell values", Array.from(this.cellValues.entries()).map(entry => entry.toString()))
  }
}