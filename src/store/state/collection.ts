import { State } from "../tokenRegistry.js"
import { getTokenOrigin, withTokenOrigin } from "./tokenOrigin.js"

export interface Collection<Key, S extends State<any>> {
  at(index: Key): S
}

export function collection<Key, S extends State<any>>(
  generator: (id: Key) => S,
): Collection<Key, S> {
  const registry = new Map<Key, S>()
  const origin = getTokenOrigin()

  return {
    at: (index: Key) => {
      let token = registry.get(index)
      if (token === undefined) {
        token = withTokenOrigin(origin, () => generator(index))
        registry.set(index, token)
      }
      return token
    },
  }
}
