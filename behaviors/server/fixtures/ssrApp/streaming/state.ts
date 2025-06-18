import { container, derived, State } from "@store/index";

export interface Thing {
  name: string
  color: string
}

export const things = container<Array<Thing>>({ initialValue: [] })

export const thingCount = derived(get => get(things).length)

export const thingValue = container({ initialValue: "unknown" })

export const serializedTokens: Record<string, State<any>> = {
  things, thingValue
}