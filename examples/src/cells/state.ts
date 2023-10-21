import { Container, GetState, Value, rule, container, value, write } from "@spheres/store";

const cells: Map<string, Container<Value<string | number>>> = new Map()

export function cellContainer(id: string): Container<Value<string | number>> {
  let cell = cells.get(id)
  if (!cell) {
    cell = container({
      initialValue: value<string | number>({
        query: () => ""
      })
    })
    cells.set(id, cell)
  }
  return cell
}

export interface CellDefinition {
  cell: string
  definition: string
}

export const updateCellDefinitionRule = rule((_: GetState, definition: CellDefinition) => {
  const cell = cellContainer(definition.cell)
  if (definition.definition.startsWith("=")) {
    const cellReference = definition.definition.substring(1)
    return write(cell, value({
      query: (get) => get(get(cellContainer(cellReference)))
    }))
  }

  return write(cell, value<string | number>({
    query: () => definition.definition
  }))
})