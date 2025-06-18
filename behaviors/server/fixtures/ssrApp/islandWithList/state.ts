import { container, supplied } from "@store/index.js"

export interface Item {
  name: string
  color: string
}

export const items = container<Array<Item>>({ initialValue: [] })

export const suppliedTitle = supplied({ initialValue: "Fruits!" })

export const serializedTokens = {
  items, suppliedTitle
}