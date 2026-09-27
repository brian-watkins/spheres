import { container } from "@store/index.js"

export const items = container<Array<string>>({ initialValue: [] })

export const serializedTokens = {
  items,
}
