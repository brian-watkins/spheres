import { Store, write } from "@spheres/store";
import { Context } from "esbehavior";
import { CellContainer, cellContainer } from "../../../../src/cells/state";

export function testStoreContext(): Context<TestStore> {
  return {
    init: () => new TestStore()
  }
}

export class TestStore {
  private store = new Store()
  private cellCollection = new Map<string, CellContainer>()
  private cellValues = new Map<string, string>()

  defineCell(id: string, definition: string) {
    const cell = cellContainer(id, this.cellCollection)
    this.store.dispatch(write(cell, definition))
    this.store.useEffect({
      run: (get) => {
        try {
          this.cellValues.set(id, `${get(get(cell))}`)
        } catch (err) {
          console.log("Erro", err)
          throw err
        }
        
      }
    })
  }

  updateCell(id: string, value: string) {
    const cell = cellContainer(id, this.cellCollection)
    this.store.dispatch(write(cell, value))
  }

  getCellValue(id: string): string {
    return this.cellValues.get(id) ?? "<UNDEFINED CELL>"
  }

  printall() {
    console.log("cell values", Array.from(this.cellValues.entries()).map(entry => entry.toString()))
  }
}