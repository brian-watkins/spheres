import { container } from "@store/index.js";

export interface Item {
  name: string
}

export interface AddItem {
  type: "add"
  item: Item
}

export function addItem(item: Item): AddItem {
  return {
    type: "add",
    item
  }
}

export type ItemsMessage = AddItem

export const items = container<Array<Item>, ItemsMessage>({
  initialValue: [],
  update(message, current) {
    switch (message.type) {
      case "add": {
        return {
          value: [ ...current, message.item ]
        }
      }
    }
  },
})

export const serializedTokens = {
  items
}