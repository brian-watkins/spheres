import { container } from "@spheres/store"

export interface Item {
  name: string
  color: string
}

export const items = container<Array<Item>>({ initialValue: [] })