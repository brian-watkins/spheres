import { container, supplied } from "@spheres/store"

export interface Item {
  name: string
  color: string
}

export const items = container<Array<Item>>({ id: "items", initialValue: [] })

export const suppliedTitle = supplied({ id: "title", initialValue: "Fruits!" })
