import { Store, write } from "@spheres/store";
import { Context } from "esbehavior";
import { cellContainer } from "../../../../src/cells/state";
import { Result } from "../../../../src/cells/result";

export function testStoreContext(): Context<TestStore> {
  return {
    init: () => new TestStore()
  }
}

export class TestStore {
  private store = new Store()
  private cellValues = new Map<string, Result<string, string>>()

  defineCell(id: string, definition: string) {
    const cell = cellContainer(id)
    this.store.dispatch(write(cell, definition))
    this.store.useEffect({
      run: (get) => {
        try {
          this.cellValues.set(id, get(get(cell)))
        } catch (err) {
          console.log("Erro", err)
          throw err
        }
      }
    })
  }

  updateCell(id: string, value: string) {
    const cell = cellContainer(id)
    this.store.dispatch(write(cell, value))
  }

  getCellValue(id: string): string {
    return this.cellValues.get(id)?.withDefault("<ERROR IN CELL>") ?? "<UNDEFINED CELL>"
  }

  getCellResult(id: string): Result<string, string> {
    return this.cellValues.get(id) ?? Result.err("<UNDEFINED CELL>")
  }

  printall() {
    console.log("cell values", Array.from(this.cellValues.entries()).map(entry => entry.toString()))
  }
}