import { container, derived, StateManifest } from "@store/index";

export interface Thing {
  name: string
  color: string
}

export const things = container<Array<Thing>>({ initialValue: [] })

export const thingCount = derived(get => get(things).length)

export const thingValue = container({ initialValue: "unknown" })

export const someWord = container({ initialValue: "" })

export const serializedTokens: StateManifest = {
  things, thingValue, someWord
}