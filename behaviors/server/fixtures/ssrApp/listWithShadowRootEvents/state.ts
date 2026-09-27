import { container } from "@store/index.js"

export const items = container<Array<string>>({ initialValue: [] })

export const clicks = container({ initialValue: 0 })

export const serializedTokens = {
  items,
  clicks,
}
