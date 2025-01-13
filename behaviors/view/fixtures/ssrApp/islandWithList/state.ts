import { container, State, supplied } from "@spheres/store"

export interface Item {
  name: string
  color: string
}

export const items = container<Array<Item>>({ initialValue: [] })

export const suppliedTitle = supplied({ initialValue: "Fruits!" })

export const tokenMap = new Map<string, State<any>>([
  ["items", items],
  ["title", suppliedTitle]
])