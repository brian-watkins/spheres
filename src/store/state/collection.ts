import { State } from "../tokenRegistry"

export interface StateCollection<S extends State<any>> {
  get(id: string): S
}

export function collection<S extends State<any>>(generator: (id: string) => S): StateCollection<S> {
  const registry = new Map<string, S>()

  return {
    get(id) {
      let token = registry.get(id)
      if (token === undefined) {
        token = generator(id)
        registry.set(id, token)
      }
      return token
    }
  }
}