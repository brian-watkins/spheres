import { StateReference } from "../tokenRegistry.js"

export interface Collection<Key, S extends StateReference<any>> {
  at(index: Key): S
}

export function collection<Key, S extends StateReference<any>>(generator: (id: Key) => S): Collection<Key, S> {
  const registry = new Map<Key, S>()

  return {
    at: (index: Key) => {
      let token = registry.get(index)
      if (token === undefined) {
        token = generator(index)
        registry.set(index, token)
      }
      return token
    }
  }
}