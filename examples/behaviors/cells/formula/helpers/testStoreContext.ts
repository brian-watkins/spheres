import { createStore, GetState, ReactiveEffect, use, useEffect, write } from "spheres/store";
import { Context } from "best-behavior";
import { cellContainer } from "../../../../src/cells/state";
import { Result } from "../../../../src/cells/result";
import { CellError, ParseFailure } from "../../../../src/cells/formula";

export function testStoreContext(): Context<TestStore> {
  return {
    init: () => new TestStore()
  }
}

class CellValueEffect implements ReactiveEffect {
  cellValue!: Result<string, CellError>

  constructor(private cellId: string) { }

  run(get: GetState): void {
    try {
      this.cellValue = get(get(cellContainer(get, this.cellId)).cellValue)
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
    this.store.dispatch(use(get => write(cellContainer(get, id), definition)))
    const effect = new CellValueEffect(id)
    this.cellValues.set(id, effect)
    useEffect(this.store, effect)
  }

  updateCell(id: string, value: string) {
    this.store.dispatch(use(get => write(cellContainer(get, id), value)))
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